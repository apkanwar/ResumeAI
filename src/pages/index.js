import FileUpload from "@/components/file-upload";
import Navbar from "@/components/navbar";
import SignInPills from "@/components/signin-pills";
import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>Resume Analyzer</title>
      </Head>

      <Navbar />
      <SignInPills />
      <FileUpload />
    </>
  )
}