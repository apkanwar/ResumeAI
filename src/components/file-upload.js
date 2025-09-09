import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from "@/lib/firebaseConfig";
import { auth } from "@/lib/firebaseConfig";
import { useState } from "react";
import saveToFireBase from "@/pages/api/saveToFirebase";

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

  // Function to upload the resume to Firebase Storage and get the URL
  const uploadResume = async (file) => {
    const uid = auth.currentUser?.uid;
    const fileName = file?.name || `resume_${Date.now()}.pdf`;
    const path = uid ? `resumes/${uid}/${fileName}` : `resumes/public/${fileName}`;
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file, { contentType: file?.type || 'application/pdf' });
    const downloadURL = await getDownloadURL(snapshot.ref);
    return { downloadURL, path, fileName };
  };

  async function storeUserResume(e) {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) {
      setStatus({ type: "error", message: "Please sign in before analyzing your resume." });
      return;
    }

    if (!selectedFile) {
      setStatus({ type: "error", message: "Please select a PDF to upload." });
      return;
    }

    try {
      const { downloadURL, path, fileName } = await uploadResume(selectedFile);

      const formData = {
        userId: user.uid,
        file: {
          path,
          downloadURL,
          name: fileName,
          size: selectedFile.size,
          contentType: selectedFile.type || 'application/pdf'
        },
        status: 'uploaded'
      };

      await saveToFireBase(formData, 'resumes');
      setStatus({ type: "success", message: "Resume uploaded. Starting analysis..." });
      e.target.reset();
      setSelectedFile(null);
      setSelectedFileText("Click to upload or drag and drop");
    } catch (error) {
      console.error("Failed to save data: ", error?.message || error);
      setStatus({ type: "error", message: "Failed to upload. Please try again." });
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
                <p className="text-xs text-gray-500 font-semibold">PDF</p>
              </div>
              <input required id="resumeDropzone" type="file" className="hidden" accept="application/pdf" onChange={handleFile} />
            </label>
          </div>

          {status && (
            <div className={`p-4 mt-8 ${status.type === "success" ? "bg-green-100 text-green-700 border-green-700" : "bg-red-100 text-red-700 border-red-700"} border rounded-lg`}>
              {status.message}
            </div>
          )}

          <div className="mt-10 mb-4">
            <button type="submit" className="bg-plum/90 text-white rounded-full py-1 px-6 hover:bg-plum transition-opacity duration-300 text-lg font-medium font-main w-fit">
              Analyze
            </button>
          </div>
        </form>
      </section>
    </div >
  )
}