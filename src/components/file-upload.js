import { useState } from "react";
import { auth } from "@/lib/firebaseConfig";
import { saveToFirebase, saveParsedSections } from "@/lib/firebase-resume";
import { getUserProfile } from "@/lib/firebase-profile";
import { Close } from "@mui/icons-material";

export default function FileUpload() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFileText, setSelectedFileText] = useState("Click to upload or drag and drop");
  const [status, setStatus] = useState(null);

  const handleFile = (e) => {
    const file = e?.target?.files?.[0];
    if (file) {
      setSelectedFile(file);
      setSelectedFileText(file.name || "Unnamed file");
    } else {
      setSelectedFile(null);
      setSelectedFileText("Click to upload or drag and drop");
    }
  };

  async function storeUserResume(e) {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) {
      setStatus({ type: "error", message: "Please sign in before attempting to analyze your resume." });
      return;
    }

    // Fetch user profile to determine role-based access
    let canUseAI = false;
    try {
      const prof = await getUserProfile();
      const role = (prof && prof.role) ? String(prof.role).toLowerCase() : 'user';
      canUseAI = role === 'owner' || role === 'admin';
    } catch (_) {
      // If profile fetch fails, default to no AI access for safety
      canUseAI = false;
    }

    try {
      // 1) Upload to Storage + create Firestore doc
      const { id } = await saveToFirebase(selectedFile, { status: 'uploaded' });

      // If user is not allowed to use AI, stop here
      if (!canUseAI) {
        setStatus({ type: "success", message: "Resume uploaded. (AI parsing & analysis require elevated access.)" });
        e.target.reset();
        setSelectedFile(null);
        setSelectedFileText("Click to upload or drag and drop");
        return;
      }

      // 2) Parse locally on the server via Groq (DOCX/PDF -> structured JSON)
      const form = new FormData();
      form.append('file', selectedFile);
      const resp = await fetch('/api/parse-ai', { method: 'POST', body: form });
      const data = await resp.json();
      if (!resp.ok || !data?.ok) {
        throw new Error(data?.error || 'Parse failed');
      }
      const parsed = data.parsed || {};

      // 3) Save parsed schema via shared helper
      await saveParsedSections(id, parsed);

      // 4) Run AI analysis right after parsing
      try {
        await fetch(`/api/analyze-ai?resumeId=${id}`, { method: 'POST' });
      } catch (err) {
        console.error("Analyze failed: ", err?.message || err);
        setStatus({ type: "error", message: "Parsed, but AI analysis failed. You can retry from the uploads page." });
        return;
      }

      setStatus({ type: "success", message: "Resume Uploaded, Parsed, and Analyzed" });
      e.target.reset();
      setSelectedFile(null);
      setSelectedFileText("Click to upload or drag and drop");
    } catch (error) {
      console.error("Failed to save/parse: ", error?.message || error);
      setStatus({ type: "error", message: "Failed to parse. Please try again." });
    }
  }

  return (
    <div className="pb-24 text-sm md:text-md">
      <section className="mx-4 xl:mx-auto max-w-5xl flex flex-col bg-artic-blue rounded-lg p-8 md:px-20 md:py-12">
        <form autoComplete="off" className="font-main" onSubmit={storeUserResume}>
          <div className="flex flex-col w-full">
            <h2 className="font-semibold text-2xl font-headings my-4">
              Upload Resume
            </h2>
            <label htmlFor="resumeDropzone" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center py-2">
                <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                </svg>
                <p className="mb-2 text-sm text-gray-500">{selectedFileText}</p>
                <p className="text-xs text-gray-500 font-semibold">PDF or DOCX</p>
              </div>
              <input required id="resumeDropzone" type="file" className="hidden" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={handleFile} />
            </label>
          </div>

          {status && (
            <div className={`flex flex-row items-center justify-between relative p-4 mt-8 ${status.type === "success" ? "bg-green-100 text-green-700 border-green-700" : "bg-red-100 text-red-700 border-red-700"} border rounded-lg`}>
              <span>{status.message}</span>
              <button
                type="button"
                onClick={() => setStatus(null)}
                className=" text-dm-black hover:bg-gray-400 hover:text-gray-700 rounded-full transition ease-in duration-200"
              >
                <Close fontSize="small" />
              </button>
            </div>
          )}

          <div className="mt-10 mb-4">
            <button type="submit" className="bg-plum/90 text-white rounded-full py-1 px-6 hover:bg-plum transition-opacity duration-300 text-lg font-medium font-main w-fit">
              Parse and Analyze
            </button>
          </div>
        </form>
      </section>
    </div >
  )
}