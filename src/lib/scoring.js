const NUMERIC_RX = /\b\d+(?:\.\d+)?%?|\$\d[\d,.]*/g; // numbers, percents, money
const BULLET_RX = /^[-–—•·\*]\s+/;
const SECTION_TITLES = ['experience', 'work experience', 'education', 'skills', 'projects', 'contact', 'summary', 'objective', 'certifications'];

function pct(n, d) { return d > 0 ? Math.max(0, Math.min(100, 100 * n / d)) : 0; }

export function computeObjectiveScore(text = '', sections = {}) {
    const t = (text || '').trim();
    const words = t.split(/\s+/).filter(Boolean);
    const charCount = t.length;

    // 1) Required sections present
    const required = ['experience', 'education', 'skills'];
    const present = required.filter(s =>
        hasSection(sections, s) || containsHeading(t, s)
    );
    const requiredScore = pct(present.length, required.length); // 0..100

    // 2) Achievements w/ numbers
    const lines = t.split(/\n+/);
    const bulletLines = lines.filter(l => BULLET_RX.test(l));
    const numericLines = bulletLines.filter(l => NUMERIC_RX.test(l));
    const achievementScore = bulletLines.length ? pct(numericLines.length, bulletLines.length) : 0;

    // 3) Verb quality (crudely checks for strong verbs at line start)
    const STRONG_VERBS = ['built', 'shipped', 'improved', 'increased', 'reduced', 'led', 'designed', 'implemented', 'migrated', 'optimized', 'automated', 'launched'];
    const strongVerbLines = bulletLines.filter(l => {
        const w = l.replace(BULLET_RX, '').trim().split(/\s+/)[0]?.toLowerCase();
        return STRONG_VERBS.includes(w);
    });
    const verbScore = bulletLines.length ? pct(strongVerbLines.length, bulletLines.length) : 50;

    // 4) Length sanity (heuristic)
    const idealWords = 350; // ~1 page dense resume
    const lengthScore = words.length <= 100 ? 40
        : words.length <= idealWords ? 100
            : words.length <= 800 ? 70
                : 50;

    // Weighted total
    const objective = Math.round(
        0.35 * requiredScore +
        0.35 * achievementScore +
        0.20 * verbScore +
        0.10 * lengthScore
    );

    return {
        objective,
        breakdown: { requiredScore, achievementScore, verbScore, lengthScore },
    };
}

export function computeDesignScore(text = '', sections = {}) {
    const t = (text || '').trim();
    const lines = t.split(/\n/);
    const charPerLine = lines.map(l => l.length);
    const avgLen = charPerLine.length ? (charPerLine.reduce((a, b) => a + b, 0) / charPerLine.length) : 0;

    // 1) Density (avg chars per line; too dense is bad)
    let densityScore = avgLen <= 40 ? 100
        : avgLen <= 70 ? 85
            : avgLen <= 90 ? 70
                : avgLen <= 110 ? 55
                    : 40;

    // 2) Headings present (detect common section titles)
    const headingsFound = SECTION_TITLES.filter(h => containsHeading(t, h));
    const headingsScore = pct(headingsFound.length, 5); // cap at 5

    // 3) Bullet share (helps scannability)
    const bulletShare = lines.length ? (lines.filter(l => BULLET_RX.test(l)).length / lines.length) : 0;
    const bulletScore = bulletShare >= 0.25 ? 100
        : bulletShare >= 0.15 ? 85
            : bulletShare >= 0.07 ? 70
                : 55;

    // 4) Screaming caps heuristic (too many all-caps tokens looks noisy)
    const tokens = t.split(/\s+/);
    const capsTokens = tokens.filter(w => w.length >= 4 && w === w.toUpperCase() && /[A-Z]/.test(w));
    const capsRatio = tokens.length ? (capsTokens.length / tokens.length) : 0;
    const capsScore = capsRatio <= 0.02 ? 100
        : capsRatio <= 0.04 ? 85
            : capsRatio <= 0.08 ? 70
                : 55;

    const design = Math.round(
        0.40 * densityScore +
        0.25 * headingsScore +
        0.25 * bulletScore +
        0.10 * capsScore
    );

    return {
        design,
        breakdown: { densityScore, headingsScore, bulletScore, capsScore },
    };
}

// helpers
function containsHeading(text, key) {
    const rx = new RegExp(`\\b${escapeRx(key)}\\b`, 'i');
    return rx.test(text);
}

function hasSection(sections, key) {
    const k = key.toLowerCase();
    return Object.keys(sections || {}).some(s => s.toLowerCase() === k);
}

function escapeRx(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }