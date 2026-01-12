import FAQContent from "@/components/faqContent"
import HomeNav from "@/components/home/home-nav"
import HomeFooter from "@/components/home/home-footer"
import { NextSeo } from "next-seo"

export default function FAQ() {
    return (
        <>
            <NextSeo
                title="Resume Analyzer | FAQ"
                description="Answers about how Resume Analyzer parses, scores, and helps improve your resume."
                canonical="https://www.resumeanalyzer.ai/faq"
                openGraph={{
                    url: "https://www.resumeanalyzer.ai/faq",
                    title: "Resume Analyzer | FAQ",
                    description: "Answers about how Resume Analyzer parses, scores, and helps improve your resume.",
                    images: [
                        {
                            url: "/logo.png",
                            width: 500,
                            height: 500,
                            alt: "Resume Analyzer Logo",
                            type: "image/png"
                        }
                    ],
                    siteName: "Resume Analyzer"
                }}
            />

            <div className="min-h-screen bg-gradient-to-br from-[#fff7ed] via-[#fdf2f8] to-[#e0f2fe] text-slate-900">
                <HomeNav />
                <FAQContent />
                <HomeFooter />
            </div>
        </>
    )
}
