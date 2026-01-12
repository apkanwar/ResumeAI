import Head from "next/head";
import Navbar from "@/components/navbar";
import SignInPill from "@/components/signin-pill";
import StoreContent from "@/components/store-content";

export default function Store() {
  return (
    <>
      <Head>
        <title>Resume Analyzer - Store</title>
      </Head>
      <Navbar />
      <SignInPill />
      <StoreContent />
    </>
  );
}
