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
    const sectionBullets = getExperienceBullets(sections);
    const bulletLines = sectionBullets.length ? sectionBullets : lines.filter(l => BULLET_RX.test(l));
    const numericLines = bulletLines.filter(l => NUMERIC_RX.test(String(l)));
    const achievementScore = bulletLines.length ? pct(numericLines.length, bulletLines.length) : 0;

    // 3) Verb quality (crudely checks for strong verbs at line start)
    const STRONG_VERBS = [
        'built', 'created', 'developed', 'delivered', 'designed', 'implemented', 'launched', 'shipped',
        'improved', 'increased', 'reduced', 'optimized', 'automated', 'migrated', 'refactored', 'integrated',
        'led', 'managed', 'owned', 'mentored', 'collaborated', 'architected', 'deployed',
    ];
    const strongVerbLines = bulletLines.filter(l => {
        const w = normalizeFirstWord(String(l).replace(BULLET_RX, '').trim());
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
    const nonEmptyLines = lines.map(l => String(l || '').trim()).filter(Boolean);
    const charPerLine = lines.map(l => l.length);
    const avgLen = charPerLine.length ? (charPerLine.reduce((a, b) => a + b, 0) / charPerLine.length) : 0;

    // 1) Density (avg chars per line; too dense is bad)
    let densityScore = avgLen <= 40 ? 100
        : avgLen <= 70 ? 85
            : avgLen <= 90 ? 70
                : avgLen <= 110 ? 55
                    : 40;

    // 2) Headings present (detect common section titles)
    const headingsFound = new Set();
    for (const h of SECTION_TITLES) {
        if (containsHeading(t, h)) headingsFound.add(h);
    }
    for (const key of Object.keys(sections || {})) {
        const k = String(key || '').toLowerCase();
        if (!k) continue;
        if (!isNonEmptySectionValue(sections[key])) continue;
        if (SECTION_TITLES.includes(k)) headingsFound.add(k);
        if (k === 'experience') headingsFound.add('work experience');
    }
    const headingsScore = pct(Math.min(headingsFound.size, 5), 5); // cap at 5

    // 3) Bullet share (helps scannability)
    let bulletScore = 0;
    const expBulletCounts = getExperienceBulletCounts(sections);
    if (expBulletCounts.jobsCount > 0) {
        // Score based on "min 3 bullets per job" expectation.
        bulletScore = pct(expBulletCounts.jobsWithAtLeast3Bullets, expBulletCounts.jobsCount);
    } else {
        // Fallback when we don't have structured experience: estimate bullet density from raw text.
        const bulletLikeCount = lines.filter(l => BULLET_RX.test(l)).length;
        const denom = nonEmptyLines.length || lines.length || 0;
        const bulletShare = denom ? (bulletLikeCount / denom) : 0;
        bulletScore = bulletShare >= 0.25 ? 100
            : bulletShare >= 0.15 ? 85
                : bulletShare >= 0.07 ? 70
                    : 55;
    }

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

function isNonEmptySectionValue(v) {
    if (v == null) return false;
    if (Array.isArray(v)) return v.length > 0;
    if (typeof v === 'string') return v.trim().length > 0;
    if (typeof v === 'object') return Object.keys(v).length > 0;
    return true;
}

function getExperienceBullets(sections = {}) {
    const exp = sections?.experience;
    if (!Array.isArray(exp)) return [];
    const bullets = [];
    for (const job of exp) {
        const details = job?.details;
        if (!Array.isArray(details)) continue;
        for (const d of details) {
            const s = String(d ?? '').trim();
            if (!s) continue;
            bullets.push(s);
        }
    }
    return bullets;
}

function getExperienceBulletCounts(sections = {}) {
    const exp = sections?.experience;
    if (!Array.isArray(exp) || exp.length === 0) {
        return { jobsCount: 0, jobsWithAtLeast3Bullets: 0, avgBulletsPerJob: 0 };
    }
    const counts = exp.map((job) => {
        const details = Array.isArray(job?.details) ? job.details : [];
        return details.map(d => String(d ?? '').trim()).filter(Boolean).length;
    });
    const jobsCount = exp.length;
    const jobsWithAtLeast3Bullets = counts.filter((n) => n >= 3).length;
    const avgBulletsPerJob = counts.reduce((a, b) => a + b, 0) / jobsCount;
    return { jobsCount, jobsWithAtLeast3Bullets, avgBulletsPerJob };
}

function normalizeFirstWord(line) {
    const first = String(line || '').split(/\s+/)[0] || '';
    return first.toLowerCase().replace(/^[^a-z]+|[^a-z]+$/g, '');
}
