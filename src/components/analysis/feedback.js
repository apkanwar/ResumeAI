"use client";
import React from "react";

export default function PageFeedback({ feedback = {} }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg border p-5 border-gray-500">
                <h3 className="font-semibold mb-2 font-headings">Subjective Feedback</h3>
                <ul className="list-disc ml-5 text-sm space-y-1 font-main">
                    {(feedback.subjective || []).length ? (
                        feedback.subjective.map((f, i) => <li key={i}>{f}</li>)
                    ) : (
                        <li className="text-gray-500">None</li>
                    )}
                </ul>
            </div>
            <div className="rounded-lg border p-5 border-gray-500">
                <h3 className="font-semibold mb-2 font-headings">Employer Feedback</h3>
                <ul className="list-disc ml-5 text-sm space-y-1 font-main">
                    {(feedback.employer || []).length ? (
                        feedback.employer.map((f, i) => <li key={i}>{f}</li>)
                    ) : (
                        <li className="text-gray-500">None</li>
                    )}
                </ul>
            </div>
        </div>
    );
}