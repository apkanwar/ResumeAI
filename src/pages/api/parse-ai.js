import multiparty from "multiparty";
import { makeAIClient } from "@/lib/aiClient";
import { requireUser } from '@/lib/requireUser';
import { adminDb, adminFieldValue } from '@/lib/firebaseAdmin';

export const config = { api: { bodyParser: false } };

const MODEL = process.env.NEXT_PUBLIC_AI_MODEL

const MAX_CHARS = 60000; // budget to keep prompt under model context

function parseForm(req) {
  return new Promise((resolve, reject) => {
    const form = new multiparty.Form();
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
}

function getExt(name = "") {
  const m = String(name).toLowerCase().match(/\.([a-z0-9]+)$/);
  return m ? m[1] : "";
}

async function readFileToText(filePath, ext) {
  if (ext === "docx") {
    const mammoth = await import("mammoth");
    const { value } = await mammoth.extractRawText({ path: filePath });
    return (value || "").trim();
  }
  const fs = await import("fs/promises");
  const pdfParse = (await import("pdf-parse")).default;
  const buf = await fs.readFile(filePath);
  const out = await pdfParse(buf);
  return (out?.text || "").trim();
}

function clamp(s, max = 60000) {
  if (!s) return "";
  return s.length > max ? s.slice(0, max) : s;
}

const SCHEMA = {
  type: "object",
  properties: {
    contact: {
      type: "object",
      properties: {
        name: { type: "string", nullable: true },
        email: { type: "string", nullable: true },
        phone: { type: "string", nullable: true },
        linkedin: { type: "string", nullable: true },
        github: { type: "string", nullable: true },
        website: { type: "string", nullable: true },
        location: { type: "string", nullable: true },
      },
    },
    education: { type: "string" },
    skills: { type: "array", items: { type: "string" } },
    skillsByCategory: {
      type: "object",
      additionalProperties: { type: "array", items: { type: "string" } },
    },
    experience: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string", nullable: true },
          company: { type: "string", nullable: true },
          location: { type: "string", nullable: true },
          start: { type: "string", nullable: true },
          end: { type: "string", nullable: true },
          details: { type: "array", items: { type: "string" } },
        },
      },
    },
    references: { type: "string" },
  },
  required: ["contact", "education", "skills", "experience", "references"],
};

function systemPrompt() {
  return [
    "You are a deterministic resume parsing engine.",
    "Output MUST be valid JSON only (no markdown, no commentary).",
    "Use only the given resume text. Do not invent or infer facts not present.",
    "If a field is unknown: use null for strings and [] for arrays.",
    "Normalize whitespace; strip bullet glyphs from details.",
    "Structure experience as title/company/location/start/end/details (details is an array of bullets).",
    "Cap arrays at a reasonable length (skills <= 64, details per job <= 16).",
  ].join(" ");
}

const EXEMPLAR = {
  contact: { name: null, email: null, phone: null, linkedin: null, github: null, website: null, location: null },
  education: "",
  skills: [],
  skillsByCategory: {},
  experience: [
    { title: null, company: null, location: null, start: null, end: null, details: [] }
  ],
  references: ""
};

function userPrompt(text) {
  return [
    "TASK: Parse the resume text into the STRICT JSON that matches the JSON_SCHEMA.",
    "Return JSON ONLY. No extra keys. No markdown.",
    "",
    "JSON_SCHEMA:",
    JSON.stringify(SCHEMA),
    "",
    "JSON_EXAMPLE:",
    JSON.stringify(EXEMPLAR),
    "",
    "RESUME_TEXT:",
    text
  ].join("\n");
}

function safeParse(s, fallback = {}) {
  try { return JSON.parse(s); } catch { return fallback; }
}

function normalize(out) {
  const o = out || {};
  let skills = Array.isArray(o.skills) ? o.skills.map(x => String(x).trim()).filter(Boolean) : [];
  skills = Array.from(new Set(skills)).slice(0, 64);

  const skillsByCategory = (o.skillsByCategory && typeof o.skillsByCategory === "object") ? o.skillsByCategory : {};

  const experience = Array.isArray(o.experience) ? o.experience.map(j => {
    const details = Array.isArray(j.details) ? j.details
      .map(d => String(d).replace(/^[-•\s]+/, "").trim())
      .filter(Boolean)
      .slice(0, 16)
      .map(d => d.length > 300 ? d.slice(0, 297) + '…' : d)
      : [];
    return {
      title: j.title || null,
      company: j.company || null,
      location: j.location || null,
      start: j.start || null,
      end: j.end || null,
      details,
    };
  }) : [];

  return {
    contact: o.contact || {},
    education: (o.education || "").trim(),
    skills,
    skillsByCategory,
    experience,
    references: (o.references || "").trim(),
  };
}

async function reserveParseToken(uid) {
  const ref = adminDb.collection('profiles').doc(String(uid));
  return adminDb.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) {
      const err = new Error('Profile not found');
      err.code = 'NO_PROFILE';
      throw err;
    }
    const data = snap.data() || {};
    let tokens = Number(data.parseTokens);
    if (!Number.isFinite(tokens)) {
      tokens = 1;
    }
    if (tokens <= 0) {
      const err = new Error('No parse tokens remaining');
      err.code = 'NO_TOKENS';
      throw err;
    }
    const next = tokens - 1;
    tx.update(ref, { parseTokens: next });
    return { ref, tokensLeft: next };
  });
}

async function refundParseToken(ref) {
  try {
    await ref.update({ parseTokens: adminFieldValue.increment(1) });
  } catch (err) {
    console.error('Failed to refund parse token', err);
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });
  const { uid, role } = await requireUser(req);
  const normalizedRole = String(role || 'user').toLowerCase();
  if (normalizedRole !== 'user' && normalizedRole !== 'admin') {
    return res.status(403).json({ ok: false, error: 'Your role is not permitted to parse resumes.' });
  }
  const needsToken = normalizedRole === 'user';
  let tokenReservation = null;
  try {
    const { files } = await parseForm(req);
    const fileObj = Array.isArray(files?.file) ? files.file[0] : files?.file?.[0] || files?.file;
    if (!fileObj?.path) return res.status(400).json({ error: "Missing file" });

    const ext = getExt(fileObj.originalFilename || fileObj.path || "");
    const raw = await readFileToText(fileObj.path, ext);
    const text = clamp(raw, MAX_CHARS);

    if (needsToken) {
      try {
        tokenReservation = await reserveParseToken(uid);
      } catch (err) {
        if (err?.code === 'NO_TOKENS') {
          return res.status(402).json({ ok: false, error: 'No parse tokens remaining. Visit the store to purchase more.' });
        }
        throw err;
      }
    }

    const client = makeAIClient();
    const completion = await client.chat.completions.create({
      model: MODEL,
      temperature: 0.1,
      messages: [
        { role: "system", content: systemPrompt() },
        { role: "user", content: userPrompt(text) },
      ],
      response_format: { type: "json_object" },
    });

    const content = completion.choices?.[0]?.message?.content || "{}";
    const parsed = normalize(safeParse(content, {}));

    // Return the structured result to the client; the client can store it in Firestore.
    return res.status(200).json({
      ok: true,
      parsed,
      tokensRemaining: needsToken ? tokenReservation?.tokensLeft ?? null : null
    });
  } catch (e) {
    console.error("[/api/parse-ai]", e);
    if (needsToken && tokenReservation?.ref) {
      await refundParseToken(tokenReservation.ref);
    }
    return res.status(500).json({ ok: false, error: e?.message || "AI parse failed" });
  }
}
