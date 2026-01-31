import Head from "next/head";
import HomeNav from "@/components/navbar";
import StoreContent from "@/components/dashboard/store-content";

export default function Store() {
  return (
    <>
      <Head>
        <title>Resume Analyzer - Store</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-[#fff7ed] via-[#fdf2f8] to-[#e0f2fe] text-slate-900">
        <HomeNav />
        <div className="my-16">

        </div>
        <StoreContent />
      </div>
    </>
  );
}
