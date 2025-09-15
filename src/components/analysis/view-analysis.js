"use client";
import React, { forwardRef, useImperativeHandle, useState } from "react";
import { db } from "@/lib/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import PageScores from "./score-rings";
import PageBreakdownImprove from "./breakdown";
import PageHighlightsRisks from "./highlights";
import PageFeedback from "./feedback";
import { Close, Download, NavigateBefore, NavigateNext } from "@mui/icons-material";
import ScoreRing from "../ring";


const ViewAnalysis = forwardRef(function ViewAnalysis(_, ref) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [resume, setResume] = useState(null);

    const [page, setPage] = useState(1); // 1..4
    const totalPages = 4;

    const nextPage = () => setPage(p => Math.min(totalPages, p + 1));
    const prevPage = () => setPage(p => Math.max(1, p - 1));

    const downloadAnalysis = () => {
        try {
            const ai = resume?.analysis?.ai || {};
            const blob = new Blob([JSON.stringify(ai, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            const base = (resume?.file?.name || 'analysis').replace(/\.[^/.]+$/, '');
            a.href = url;
            a.download = `${base}-analysis.json`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        } catch (e) {
            console.error('downloadAnalysis failed', e);
        }
    };

    useImperativeHandle(ref, () => ({
        open: async (resumeOrId) => {
            try {
                setError("");
                setLoading(true);
                setOpen(true);
                setPage(1);
                const id = typeof resumeOrId === 'string' ? resumeOrId : resumeOrId?.id;
                if (!id) throw new Error('Missing resume id');
                const snap = await getDoc(doc(db, 'resumes', id));
                if (!snap.exists()) throw new Error('Resume not found');
                setResume({ id, ...snap.data() });
            } catch (e) {
                setError(e?.message || 'Failed to load analysis');
            } finally {
                setLoading(false);
            }
        },
        close: () => setOpen(false),
    }), []);

    if (!open) return null;

    const ai = resume?.analysis?.ai || {};
    const scores = ai?.scores || {};
    const breakdown = ai?.breakdown || {};
    const feedback = ai?.feedback || {};

    const overall = Math.round((
        (scores.objective ?? 0) +
        (scores.subjective ?? 0) +
        (scores.design ?? 0) +
        (scores.employer ?? 0)
    ) / 4);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
            <div className="relative z-10 w-full max-w-3xl h-[80vh] overflow-y-auto rounded-xl bg-white p-5 shadow-xl">
                {/* Sticky Header */}
                <div className="sticky top-0 z-10 bg-white border-b-2 border-plum p-5">
                    <div className="flex items-center justify-between font-headings">
                        <div className="flex flex-row items-center gap-6">
                            <div className="min-w-0">
                                <h2 className="text-xl font-semibold font-headings">Resume Analysis</h2>
                                <div className="text-sm text-gray-500 truncate">{resume?.file?.name}</div>
                            </div>
                            <ScoreRing value={overall} size='40' stroke='4' />
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={downloadAnalysis}
                                className="rounded-full border border-dm-black px-2 py-0.5 hover:bg-gray-200"
                                title="Download Analysis (JSON)">
                                <Download />
                            </button>
                            <button onClick={() => setOpen(false)}
                                className="rounded-full border border-dm-black px-2 py-0.5 hover:bg-gray-200"
                                title="Close">
                                <Close />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Page indicator */}
                <div className="flex items-center justify-between p-5">
                    <div className="text-gray-500 font-headings text-sm">Page {page} of {totalPages}</div>
                    <div className="flex gap-2">
                        <button onClick={prevPage} disabled={page === 1}
                            className="rounded-full border border-dm-black px-3 py-1 hover:bg-gray-200 disabled:hover:bg-transparent disabled:opacity-50">
                            <NavigateBefore />
                        </button>
                        <button onClick={nextPage} disabled={page === totalPages}
                            className="rounded-full border border-dm-black px-3 py-1 hover:bg-gray-200 disabled:hover:bg-transparent disabled:opacity-50">
                            <NavigateNext />
                        </button>
                    </div>
                </div>

                {/* PAGE 1: Score Rings */}
                {page === 1 && <PageScores scores={scores} />}

                {/* PAGE 2: Breakdown + How to Improve */}
                {page === 2 && <PageBreakdownImprove breakdown={breakdown} />}

                {/* PAGE 3: Highlights & Risks */}
                {page === 3 && <PageHighlightsRisks feedback={feedback} />}

                {/* PAGE 4: Feedback */}
                {page === 4 && <PageFeedback feedback={feedback} />}

                {/* Raw sections preview (optional) */}
                {/* <details className="rounded-lg border p-3">
                    <summary className="cursor-pointer font-semibold">Parsed Sections (raw)</summary>
                    <pre className="mt-2 max-h-64 overflow-auto text-xs bg-gray-50 p-2 rounded">
                        {JSON.stringify(resume?.analysis?.sections || {}, null, 2)}
                    </pre>
                </details> */}

            </div>
        </div>
    );
});

export default ViewAnalysis;