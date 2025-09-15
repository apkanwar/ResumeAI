"use client";
import React from "react";

export default function PageHighlightsRisks({ feedback = {} }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg border p-5 border-gray-500">
                <h3 className="font-semibold mb-2 font-headings">Highlights</h3>
                <ul className="list-disc ml-5 text-sm space-y-1 font-main">
                    {(feedback.highlights || []).length ? (
                        feedback.highlights.map((f, i) => <li key={i}>{f}</li>)
                    ) : (
                        <li className="text-gray-500">None</li>
                    )}
                </ul>
            </div>
            <div className="rounded-lg border p-5 border-gray-500">
                <h3 className="font-semibold mb-2 font-headings">Risks</h3>
                <ul className="list-disc ml-5 text-sm space-y-1 font-main">
                    {(feedback.risks || []).length ? (
                        feedback.risks.map((f, i) => <li key={i}>{f}</li>)
                    ) : (
                        <li className="text-gray-500">None</li>
                    )}
                </ul>
            </div>
        </div>
    );
}