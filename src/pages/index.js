import { NextSeo } from "next-seo";
import Navbar from "@/components/navbar";
import Hero from "@/components/home/hero";
import Features from "@/components/home/features";
import Numbers from "@/components/home/numbers";
import CTA from "@/components/home/cta";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <>
      <NextSeo
        title="Resume Analyzer"
        description="AI-powered resume analysis, scoring, and personalized improvements."
        canonical={process.env.NEXT_PUBLIC_SITE_URL}
        openGraph={{
          url: process.env.NEXT_PUBLIC_SITE_URL,
          title: "Resume Analyzer",
          description: "AI-powered resume analysis, scoring, and personalized improvements.",
          images: [
            {
              url: process.env.NEXT_PUBLIC_SITE_URL + "/full-logo.png",
              width: 1024,
              height: 1024,
              alt: "Resume Analyzer Logo",
              type: "image/png"
            }
          ],
          siteName: "Resume Analyzer"
        }}
      />

      <Navbar />
      <Hero />
      <Features />
      <Numbers />
      <CTA />
      <Footer />
    </>
  )
}
