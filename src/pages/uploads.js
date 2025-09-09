import ManageUploads from "@/components/manage-uploads";
import Navbar from "@/components/navbar";
import SignInPill from "@/components/signin-pill";
import Head from "next/head";

export default function Uploads() {
  return (
    <>
      <Head>
        <title>Resume Analyzer - Uploads</title>
      </Head>

      <Navbar />
      <SignInPill />
      <ManageUploads />
    </>
  )
}