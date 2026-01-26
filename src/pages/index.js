import Head from "next/head";
import Navbar from "@/components/navbar";
import Hero from "@/components/home/hero";
import Features from "@/components/home/features";
import Numbers from "@/components/home/Numbers";
import CTA from "@/components/home/cta";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <>
      <Head>
        <title>Resume Analyzer</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-[#fff7ed] via-[#fdf2f8] to-[#e0f2fe] text-slate-900">
        <Navbar />
        <Hero />
        <Features />
        <Numbers />
        <CTA />
        <Footer />
      </div>
    </>
  )
}
