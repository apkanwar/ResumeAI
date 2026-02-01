import { useIsVisible } from '@/lib/useIsVisible';
import { Disclosure } from '@headlessui/react';
import { useEffect, useRef, useState } from 'react';

export default function FAQContent() {
  const faqQA = [
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

  return (
    <div className="opacity-100 transition-opacity ease-in duration-1000 mx-auto max-w-5xl px-6 pt-32 pb-12 text-slate-900">
      <h1 className='text-5xl font-headings font-semibold pb-16'>Frequently Asked Questions</h1>
      <div className="space-y-4">
        {faqQA.map((q) => (
          <Disclosure key={q.id}>
            {({ open }) => (
              <>
                <Disclosure.Button className="flex text-start justify-between my-auto w-full text-lg font-headings font-semibold text-slate-900 bg-transparent transition-all">
                  <span>{q.question}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-5 w-5 ${open ? 'transform rotate-180' : ''}`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6.293 9.293a1 1 0 011.414 0L10 11.586l2.293-2.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Disclosure.Button>
                <Disclosure.Panel className="font-main text-slate-700 bg-transparent pb-3">
                  {open ? (
                    <p className="whitespace-pre-line text-slate-700">{q.answer}</p>
                  ) : null}
                </Disclosure.Panel>
                <hr className="border-slate-200" />
              </>
            )}
          </Disclosure>
        ))}
      </div>
    </div>
  );
};
