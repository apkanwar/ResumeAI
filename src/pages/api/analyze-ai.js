import { makeAIClient } from "@/lib/aiClient";
import { computeObjectiveScore, computeDesignScore } from "@/lib/scoring";
import { adminDb } from "@/lib/firebaseAdmin";
import { requireUser } from '@/lib/requireUser';

const SYSTEM_MSG = `
You are a senior resume reviewer and hiring manager.
Follow the rubric precisely. Output MUST be valid JSON only (no Markdown, no commentary).
Never invent data not present in the resume/profile.
Cap each feedback array to at most 8 items. Use concise, actionable bullets.
Scores are 0–100 integers.

Rubric:
- subjectiveScore: Writing clarity, specificity, action verbs, impact, leadership signals.
- employerScore: Match vs target role/seniority/keywords/industries/locations from USER_PROFILE.
- Do not include PII beyond what the resume already contains.
- If required inputs are missing/weak, still return JSON with best-effort scores and add a risk note.
`.trim();

// ~LLaMA-ish estimate: ~4 characters ≈ 1 token
const estTokens = (s) => Math.ceil(((s || '').length) / 4);
function sliceTextToBudget(text, fixedOverheadTokens, targetPromptBudget = 7000) {
    const remaining = Math.max(500, targetPromptBudget - fixedOverheadTokens);
    const maxChars = Math.floor(remaining * 4);
    return (text || '').slice(0, maxChars);
}

export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method Not Allowed" });
    const me = await requireUser(req);
    try {
        const { resumeId } = req.query;
        if (!resumeId) return res.status(400).json({ ok: false, error: "Missing resumeId" });

        // 1) Load resume (must be parsed already)
        const rRef = adminDb.collection('resumes').doc(String(resumeId));
        const rSnap = await rRef.get();
        if (!rSnap.exists) return res.status(404).json({ ok: false, error: 'Resume not found' });
        const resume = rSnap.data();
        const normalizedRole = String(me.role || '').toLowerCase();
        const canAccessAny = normalizedRole === 'admin' || normalizedRole === 'owner';
        if (!canAccessAny && resume.userId !== me.uid) {
            return res.status(403).json({ ok: false, error: 'Forbidden' });
        }
        const sections = resume?.analysis?.sections || {};
        const rawText = resume?.analysis?.text || joinSectionsText(sections);

        // 2) Load user profile
        const pRef = adminDb.collection('profiles').doc(String(resume.userId));
        const pSnap = await pRef.get();
        const profile = pSnap.exists ? pSnap.data() : {};

        // 3) Rules scores
        const { objective, breakdown: objBreakdown } = computeObjectiveScore(rawText, sections);
        const { design, breakdown: desBreakdown } = computeDesignScore(rawText, sections);

        // 4) LLM: subjective + employer
        const client = makeAIClient();
        const model = process.env.AI_MODEL || "llama-3.1-8b-instant";

        // Budget-aware RAW_TEXT trimming to fit 8k context comfortably
        const overheadStrLen = JSON.stringify(sections).length + JSON.stringify(profile).length + 2000; // ~2k for instructions/schema
        const overheadTokens = Math.ceil(overheadStrLen / 4);
        const RAW_TEXT_BUDGETED = sliceTextToBudget(rawText, overheadTokens, 7000);

        const prompt = buildLLMPrompt(RAW_TEXT_BUDGETED, sections, profile);

        const completion = await client.chat.completions.create({
            model,
            temperature: 0.2,
            response_format: { type: "json_object" },
            messages: [
                { role: "system", content: SYSTEM_MSG },
                { role: "user", content: prompt },
            ],
        });

        const content = completion.choices?.[0]?.message?.content || "{}";
        const llm = safeParse(content, {
            subjectiveScore: 70,
            subjectiveFeedback: [],
            employerScore: 70,
            employerFeedback: [],
            highlights: [],
            risks: [],
            suggestions: [],
        });

        // 5) Persist
        const scores = {
            objective,
            design,
            subjective: clamp0to100(llm.subjectiveScore ?? 70),
            employer: clamp0to100(llm.employerScore ?? 70),
        };

        await rRef.update({
          status: 'analyzed',
          analysis: {
            ...(resume.analysis || {}),
            ai: {
              scores,
              breakdown: { objective: objBreakdown, design: desBreakdown },
              feedback: {
                subjective: llm.subjectiveFeedback || [],
                employer: llm.employerFeedback || [],
                highlights: llm.highlights || [],
                risks: llm.risks || [],
                suggestions: llm.suggestions || [],
              },
              model,
              updatedAt: new Date().toISOString(),
            },
          },
          updatedAt: new Date(),
        });

        return res.status(200).json({ ok: true, scores });
    } catch (e) {
        console.error("[/api/analyze-ai]", e);
        return res.status(500).json({ ok: false, error: e?.message || "Analyze failed" });
    }
}

// ---------- helpers ----------
function safeParse(s, fb) { try { return JSON.parse(s); } catch { return fb; } }
function clamp0to100(n) { return Math.max(0, Math.min(100, Number(n) || 0)); }
function joinSectionsText(sections = {}) {
    const parts = [];
    if (sections.contact) parts.push(JSON.stringify(sections.contact));
    if (sections.education) parts.push(String(sections.education));
    if (sections.skills) parts.push(String(sections.skills?.join(", ")));
    if (sections.experience) parts.push(sections.experience.map(x => [x.title, x.company, x.location, x.start, x.end, ...(x.details || [])].filter(Boolean).join("\n")).join("\n"));
    if (sections.references) parts.push(String(sections.references));
    return parts.join("\n\n");
}

function buildLLMPrompt(text, sections, profile) {
    const prof = {
        role: profile?.targetRole || null,
        seniority: profile?.seniority || null,
        industries: profile?.industries || [],
        mustHaveKeywords: profile?.mustHaveKeywords || [],
        niceToHaveKeywords: profile?.niceToHaveKeywords || [],
        locations: profile?.locations || [],
    };

    const schema = {
        type: "object",
        required: [
            "subjectiveScore",
            "employerScore",
            "subjectiveFeedback",
            "employerFeedback",
            "highlights",
            "risks",
            "suggestions"
        ],
        properties: {
            subjectiveScore: { type: "integer", minimum: 0, maximum: 100 },
            employerScore: { type: "integer", minimum: 0, maximum: 100 },
            subjectiveFeedback: { type: "array", items: { type: "string" }, maxItems: 8 },
            employerFeedback: { type: "array", items: { type: "string" }, maxItems: 8 },
            highlights: { type: "array", items: { type: "string" }, maxItems: 8 },
            risks: { type: "array", items: { type: "string" }, maxItems: 8 },
            suggestions: { type: "array", items: { type: "string" }, maxItems: 8 }
        },
        additionalProperties: false
    };

    const exemplar = {
        subjectiveScore: 0,
        employerScore: 0,
        subjectiveFeedback: ["..."],
        employerFeedback: ["..."],
        highlights: ["..."],
        risks: ["..."],
        suggestions: ["..."]
    };

    return [
        "TASK: Score and critique the resume using the rubric and return STRICT JSON matching the JSON Schema below.",
        "",
        "JSON_SCHEMA:",
        JSON.stringify(schema),
        "",
        "JSON_EXAMPLE:",
        JSON.stringify(exemplar),
        "",
        "GUIDELINES:",
        "- Use integers for scores.",
        "- Each feedback bullet must be specific and actionable (what to add/change).",
        "- If evidence is missing for a claim, call it out in risks.",
        "- Prefer role-aligned keywords from USER_PROFILE; do not overfit/noise.",
        "- No backticks. No extra keys. No markdown.",
        "",
        "USER_PROFILE:",
        JSON.stringify(prof),
        "",
        "RESUME_SECTIONS:",
        JSON.stringify(sections),
        "",
        "RAW_TEXT (budgeted):",
        (text || "").slice(0, 60000)
    ].join("\n");
}
