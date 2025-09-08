import FileUpload from "@/components/file-upload";
import Navbar from "@/components/navbar";
import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>Resume Analyzer</title>
      </Head>

      <Navbar />
      <FileUpload />
    </>
  )
}