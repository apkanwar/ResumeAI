"use client";
import React from "react";

function improvementTips(breakdown = {}) {
    const tips = { objective: [], design: [] };

    const add = (arr, score, lowMsg, medMsg) => {
        const n = Math.round(Number(score ?? 0));
        if (n <= 0 && score == null) return;
        if (n < 60) arr.push(`${lowMsg}`);
        else if (n < 75) arr.push(`${medMsg}`);
    };

    const obj = breakdown.objective || {};
    // Required sections
    add(
        tips.objective,
        obj.requiredScore,
        "Some core sections are likely missing or poorly detected (ensure clear headings for Experience, Education, Skills)",
        "Tighten section headers and structure so Experience, Education, Skills are unmistakable"
    );
    // Achievement / metrics
    add(
        tips.objective,
        obj.achievementScore,
        "Add impact metrics to more bullets (%, $, #) and outcomes (e.g., increased conversion by 18%)",
        "Increase the share of bullets with concrete metrics and outcomes"
    );
    // Strong verbs
    add(
        tips.objective,
        obj.verbScore,
        "Start bullets with strong action verbs (Built, Shipped, Improved, Led) and avoid passive voice",
        "Use more action-first phrasing in bullets"
    );
    // Length
    add(
        tips.objective,
        obj.lengthScore,
        "Right-size length (~350–500 words for 1 page); cut filler and merge redundant bullets",
        "Trim or expand slightly to hit a concise 1-page narrative"
    );

    const des = breakdown.design || {};
    // Density
    add(
        tips.design,
        des.densityScore,
        "Reduce dense lines; split long sentences; prefer bullets over long paragraphs",
        "Lighten dense areas by breaking into shorter bullets"
    );
    // Headings
    add(
        tips.design,
        des.headingsScore,
        "Add clear, scannable section headings (Experience, Education, Skills, Projects)",
        "Standardize headings and ensure consistent capitalization/spacing"
    );
    // Bullet share
    add(
        tips.design,
        des.bulletScore,
        "Use more bullet points; keep 1 idea per bullet for easier skim",
        "Increase bullet usage in body sections to improve scannability"
    );
    // ALL-CAPS
    add(
        tips.design,
        des.capsScore,
        "Avoid excessive ALL-CAPS except short labels; rely on weight/size for emphasis",
        "Reduce ALL-CAPS usage and prefer typographic emphasis"
    );

    // De-duplicate while preserving order
    tips.objective = Array.from(new Set(tips.objective));
    tips.design = Array.from(new Set(tips.design));

    return tips;
}

export default function PageBreakdownImprove({ breakdown = {} }) {
    const tips = improvementTips(breakdown);

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-lg border p-5 border-gray-500">
                    <h3 className="font-semibold mb-2 font-headings">Objective Breakdown</h3>
                    <ul className="list-disc ml-5 text-sm space-y-1 font-main">
                        {Object.entries(breakdown.objective || {}).map(([k, v]) => (
                            <li key={k}>
                                <span className="capitalize">{k.replace(/([A-Z])/g, " $1")}</span>: <b>{Math.round(Number(v))}</b>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="rounded-lg border p-5 border-gray-500">
                    <h3 className="font-semibold mb-2 font-headings">Design Breakdown</h3>
                    <ul className="list-disc ml-5 text-sm space-y-1 font-main">
                        {Object.entries(breakdown.design || {}).map(([k, v]) => (
                            <li key={k}>
                                <span className="capitalize">{k.replace(/([A-Z])/g, " $1")}</span>: <b>{Math.round(Number(v))}</b>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-lg border p-5 border-gray-500">
                    <h3 className="font-semibold mb-2 font-headings">Improve Objective</h3>
                    <ul className="list-disc ml-5 text-sm space-y-1 font-main">
                        {tips.objective.length ? tips.objective.map((t, i) => <li key={i}>{t}</li>) : <li className="text-gray-500">Looks good.</li>}
                    </ul>
                </div>
                <div className="rounded-lg border p-5 border-gray-500">
                    <h3 className="font-semibold mb-2 font-headings">Improve Design</h3>
                    <ul className="list-disc ml-5 text-sm space-y-1 font-main">
                        {tips.design.length ? tips.design.map((t, i) => <li key={i}>{t}</li>) : <li className="text-gray-500">Looks good.</li>}
                    </ul>
                </div>
            </div>
        </div>
    );
}