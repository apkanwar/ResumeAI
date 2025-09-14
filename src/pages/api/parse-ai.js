import multiparty from "multiparty";
import { makeAIClient } from "@/lib/aiClient";

export const config = { api: { bodyParser: false } };

const MODEL = process.env.NEXT_PUBLIC_AI_MODEL

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
    "You are a resume parsing engine.",
    "Return ONLY valid JSON that matches the provided JSON schema.",
    "Use only the given resume text. Do not invent facts.",
    "If a field is unknown, use null (strings) or [] (arrays).",
    "Normalize whitespace; remove bullet glyphs from details.",
    "Structure experience as title/company/location/dates/details.",
  ].join(" ");
}

function userPrompt(text) {
  return [
    "RESUME_TEXT:",
    text,
    "",
    "JSON SCHEMA:",
    JSON.stringify(SCHEMA),
    "",
    "Respond with JSON ONLY.",
  ].join("\n");
}

function safeParse(s, fallback = {}) {
  try { return JSON.parse(s); } catch { return fallback; }
}

function normalize(out) {
  const o = out || {};
  const skills = Array.isArray(o.skills) ? [...new Set(o.skills.map(x => String(x).trim()).filter(Boolean))] : [];
  const skillsByCategory = o.skillsByCategory && typeof o.skillsByCategory === "object" ? o.skillsByCategory : {};
  const experience = Array.isArray(o.experience) ? o.experience.map(j => ({
    title: j.title || null,
    company: j.company || null,
    location: j.location || null,
    start: j.start || null,
    end: j.end || null,
    details: Array.isArray(j.details) ? j.details.map(d => String(d).replace(/^[-•\s]+/, "").trim()).filter(Boolean) : [],
  })) : [];
  return {
    contact: o.contact || {},
    education: (o.education || "").trim(),
    skills,
    skillsByCategory,
    experience,
    references: (o.references || "").trim(),
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method Not Allowed" });
  try {
    const { files } = await parseForm(req);
    const fileObj = Array.isArray(files?.file) ? files.file[0] : files?.file?.[0] || files?.file;
    if (!fileObj?.path) return res.status(400).json({ error: "Missing file" });

    const ext = getExt(fileObj.originalFilename || fileObj.path || "");
    const raw = await readFileToText(fileObj.path, ext);
    const text = clamp(raw, 60000);

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
    return res.status(200).json({ ok: true, parsed });
  } catch (e) {
    console.error("[/api/parse-ai]", e);
    return res.status(500).json({ ok: false, error: e?.message || "AI parse failed" });
  }
}