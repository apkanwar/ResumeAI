"use client";
import React from "react";
import ScoreRing from "@/components/ring";

export default function PageScores({ scores = {} }) {
    return (
        <div className="text-center space-y-8">
            <h1 className="font-headings font-medium text-xl">Scores</h1>
            <div className="grid grid-cols-2 gap-y-12 gap-x-24 w-fit mx-auto">
                <ScoreRing value={scores.objective} label="Objective" size='100' />
                <ScoreRing value={scores.subjective} label="Subjective" size='100' />
                <ScoreRing value={scores.design} label="Design" size='100' />
                <ScoreRing value={scores.employer} label="Employer" size='100' />
            </div>
        </div>
    );
}