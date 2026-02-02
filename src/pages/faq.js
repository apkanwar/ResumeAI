import FAQContent from "@/components/faqContent"
import HomeNav from "@/components/navbar"
import HomeFooter from "@/components/footer"
import { NextSeo } from "next-seo"

export default function FAQ() {
    return (
        <>
            <NextSeo
                title='Resume Analyzer - FAQ'
                description='Answers about how Resume Analyzer parses, scores, and helps improve your resume.'
                canonical={process.env.NEXT_PUBLIC_SITE_URL + '/faq'}
                openGraph={{
                    url: process.env.NEXT_PUBLIC_SITE_URL + '/faq',
                    title: 'Resume Analyzer - FAQ',
                    description: 'Answers about how Resume Analyzer parses, scores, and helps improve your resume.',
                    images: [
                        {
                            url: process.env.NEXT_PUBLIC_SITE_URL + '/full-logo.png',
                            width: 1024,
                            height: 1024,
                            alt: "Resume Analyzer Logo",
                            type: "image/png"
                        }
                    ],
                    siteName: "Resume Analyzer"
                }}
            />

            <HomeNav />
            <FAQContent />
            <HomeFooter />
        </>
    )
}
