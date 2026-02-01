import { NextSeo } from "next-seo";
import HomeNav from "@/components/navbar";
import StoreContent from "@/components/dashboard/store-content";

export default function Store() {
  return (
    <>
      <NextSeo
        title="Resume Analyzer - Store"
        description="Purchase resume analysis credits and view available packages."
        canonical={process.env.NEXT_PUBLIC_SITE_URL + "/store"}
        openGraph={{
          url: process.env.NEXT_PUBLIC_SITE_URL + "/store",
          title: "Resume Analyzer - Store",
          description: "Purchase resume analysis credits and view available packages.",
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
      <div className="min-h-screen bg-gradient-to-br from-[#fff7ed] via-[#fdf2f8] to-[#e0f2fe] text-slate-900">
        <HomeNav />
        <div className="my-16">

        </div>
        <StoreContent />
      </div>
    </>
  );
}
