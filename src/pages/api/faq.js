export default function handler(req, res) {
    const FAQ = [
        {
            id: 1,
            question: "What file types do you support?",
            answer: "We currently support PDF and DOCX resumes. If a file fails to parse, try exporting to a clean PDF and re-uploading."
        },
        {
            id: 2,
            question: "How does the scoring work?",
            answer: "Scores are grouped into objective, subjective, design, and employer-fit categories. We combine those to show an overall score and provide targeted improvements."
        },
        {
            id: 3,
            question: "How long does an analysis take?",
            answer: "Most resumes are parsed and analyzed in under a minute. Large or complex files can take a bit longer."
        },
        {
            id: 4,
            question: "What are parse tokens?",
            answer: "Each analysis uses one token. You can purchase additional tokens in the store."
        },
        {
            id: 5,
            question: "Can I delete my uploads?",
            answer: "Yes. Go to your dashboard results and delete any upload. This removes the file and its associated analysis."
        },
        {
            id: 6,
            question: "Is my resume data private?",
            answer: "Your uploads are tied to your account, and only you can view them in your dashboard. You can delete them at any time."
        },
        {
            id: 7,
            question: "What should I do if the analysis looks off?",
            answer: "Double-check that your resume has clear headings (Experience, Education, Skills) and clean formatting. If needed, re-upload a simplified PDF."
        }
    ]
    res.status(200).json({
        FAQ
    })
}
