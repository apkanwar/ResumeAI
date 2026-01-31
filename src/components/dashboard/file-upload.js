import { useCallback, useEffect, useState } from "react";
import { auth } from "@/lib/firebaseConfig";
import { saveToFirebase, saveParsedSections } from "@/lib/firebase-resume";
import { getUserProfile } from "@/lib/firebase-profile";
import { Close } from "@mui/icons-material";
import { onAuthStateChanged } from "firebase/auth";
import LoadingOverlay from "@/components/loading-overlay";

export default function FileUpload({ panelClassName = "bg-artic-blue", onAnalysisComplete }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFileText, setSelectedFileText] = useState("Click to upload or drag and drop");
  const [status, setStatus] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [parseTokens, setParseTokens] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loadingStage, setLoadingStage] = useState(null);
  const isBusy = Boolean(loadingStage);

  const syncTokens = useCallback(async () => {
    try {
      const prof = await getUserProfile({ ensureParseTokens: true });
      const role = prof?.role ? String(prof.role).toLowerCase() : 'user';
      const count = (prof && typeof prof.parseTokens === 'number') ? prof.parseTokens : 0;
      setUserRole(role);
      if (role === 'user') {
        setParseTokens(count);
        return { role, tokens: count };
      }
      setParseTokens(null);
      return { role, tokens: null };
    } catch (err) {
      console.error('Failed to fetch parse tokens', err);
      setParseTokens(null);
      setUserRole(null);
      return null;
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        syncTokens();
      } else {
        setParseTokens(null);
        setUserRole(null);
      }
    });
    return () => unsubscribe();
  }, [syncTokens]);

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

  const allowTypes = new Set([
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ]);

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const dt = e.dataTransfer;
    if (!dt || !dt.files || !dt.files.length) return;
    const file = dt.files[0];
    if (!allowTypes.has(file.type)) {
      setStatus({ type: 'error', message: 'Only PDF or DOCX files are allowed.' });
      return;
    }
    setSelectedFile(file);
    setSelectedFileText(file.name || 'Unnamed file');
  };

  async function storeUserResume(e) {
    e.preventDefault();
    const formEl = e.currentTarget;
    let resumeIdForNavigation = null;
    let shouldNavigateToResults = false;

    const user = auth.currentUser;
    if (!user) {
      setStatus({ type: "error", message: "Please sign in before attempting to analyze your resume." });
      return;
    }
    if (!selectedFile) {
      setStatus({ type: "error", message: "Please select a PDF or DOCX before parsing." });
      return;
    }

    try {
      setStatus(null);
      setLoadingStage("Getting Things Ready...");

      // Refresh profile state before parsing
      const latest = await syncTokens();
      const role = latest?.role || userRole || 'user';
      let availableTokens = role === 'user'
        ? (typeof latest?.tokens === 'number' ? latest.tokens : (typeof parseTokens === 'number' ? parseTokens : null))
        : null;

      if (role !== 'user' && role !== 'admin') {
        setStatus({ type: "error", message: "Your account does not have permission to parse resumes." });
        return;
      }

      if (role === 'user') {
        if (typeof availableTokens !== 'number') {
          setStatus({ type: "error", message: "Unable to verify your parse tokens. Please try again." });
          return;
        }
        if (availableTokens <= 0) {
          setStatus({ type: "error", message: "You have no parse tokens left. Please visit the store to purchase more." });
          return;
        }
      }

      // 1) Upload to Storage + create Firestore doc
      setLoadingStage("Uploading Resume...");
      const { id } = await saveToFirebase(selectedFile, { status: 'uploaded' });
      resumeIdForNavigation = id;

      const idToken = await auth.currentUser.getIdToken();

      // 2) Parse locally on the server via Groq (DOCX/PDF -> structured JSON)
      setLoadingStage("Parsing Resume...");
      const form = new FormData();
      form.append('file', selectedFile);
      const resp = await fetch('/api/parse-ai', {
        method: 'POST',
        headers: { Authorization: `Bearer ${idToken}` },
        body: form,
      });
      const data = await resp.json();
      if (resp.status === 402 && role === 'user') {
        setParseTokens(0);
        throw new Error(data?.error || 'You are out of parse tokens.');
      }
      if (!resp.ok || !data?.ok) {
        throw new Error(data?.error || 'Parse failed');
      }
      const parsed = data.parsed || {};
      if (role === 'user') {
        if (typeof data.tokensRemaining === 'number') {
          setParseTokens(data.tokensRemaining);
        } else {
          setParseTokens((prev) => (typeof prev === 'number' ? Math.max(prev - 1, 0) : prev));
        }
      } else {
        setParseTokens(null);
      }

      // 3) Save parsed schema via shared helper
      await saveParsedSections(id, parsed);

      // 4) Run AI analysis right after parsing
      setLoadingStage("Analyzing Resume...");
      const analyzeResp = await fetch(`/api/analyze-ai?resumeId=${id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${idToken}` },
      });
      let analyzeJson = null;
      try { analyzeJson = await analyzeResp.json(); } catch (_) { }
      if (!analyzeResp.ok || (analyzeJson && analyzeJson.ok === false)) {
        const msg = (analyzeJson && (analyzeJson.error || analyzeJson.message)) || `Analyze failed (${analyzeResp.status})`;
        throw new Error(`Parsed, but analysis failed: ${msg}`);
      }

      setLoadingStage("Generating Report...");
      const tokensLeft = typeof data.tokensRemaining === 'number' ? data.tokensRemaining : null;
      const successMsg = role === 'admin'
        ? 'Resume Uploaded, Parsed, and Analyzed (admin access).'
        : tokensLeft !== null
          ? `Resume Uploaded, Parsed, and Analyzed. Tokens left: ${tokensLeft}.`
          : 'Resume Uploaded, Parsed, and Analyzed.';
      setStatus({ type: 'success', message: successMsg });
      shouldNavigateToResults = true;
      formEl?.reset?.();
      setSelectedFile(null);
      setSelectedFileText("Click to upload or drag and drop");
    } catch (error) {
      const fallbackMsg = error?.message || "Failed to parse. Please try again.";
      console.error("Failed to save/parse: ", fallbackMsg);
      setStatus({ type: "error", message: fallbackMsg });
      if (auth.currentUser) {
        await syncTokens();
      }
    } finally {
      setLoadingStage(null);
      if (shouldNavigateToResults && resumeIdForNavigation && typeof onAnalysisComplete === "function") {
        setTimeout(() => onAnalysisComplete(resumeIdForNavigation), 0);
      }
    }
  }

  return (
    <div className="xl:pb-24 text-sm md:text-md">
      <section className={`xl:mx-auto max-w-5xl flex flex-col ${panelClassName} rounded-lg p-8 md:px-20 md:py-12`}>
        <form autoComplete="off" className="font-main" onSubmit={storeUserResume}>
          <div className="flex flex-col w-full">
            <h2 className="font-semibold text-2xl font-headings my-4">
              Upload Resume
            </h2>
            <label
              htmlFor="resumeDropzone"
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragActive(true); }}
              onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setDragActive(true); }}
              onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); }}
              onDrop={handleDrop}
              className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100
                ${dragActive ? 'border-plum bg-white' : 'border-gray-300'}`}
            >
              <div className="flex flex-col items-center justify-center py-2">
                <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                </svg>
                <p className="mb-2 text-sm text-gray-500">{selectedFileText}</p>
                <p className="text-xs text-gray-500 font-semibold">PDF or DOCX</p>
              </div>
              <input
                required
                id="resumeDropzone"
                type="file"
                className="hidden"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleFile}
                disabled={isBusy}
              />
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

          <div className="mt-10 mb-4 flex flex-col gap-1">
            {userRole === 'admin' && (
              <span className="text-sm text-gray-700 font-main">
                Admin accounts have unlimited parse tokens.
              </span>
            )}
            {userRole === 'user' && typeof parseTokens === 'number' && (
              <span className="text-sm text-gray-700 font-main">
                Parse tokens remaining: <span className="font-semibold">{parseTokens}</span>
              </span>
            )}
            <button
              type="submit"
              disabled={isBusy}
              className="bg-top-orange/90 text-white rounded-full py-1 px-6 hover:bg-top-orange transition-opacity duration-300 text-lg font-medium font-main w-fit disabled:cursor-not-allowed disabled:opacity-70"
            >
              Parse and Analyze
            </button>
          </div>
        </form>
      </section>
      <LoadingOverlay open={isBusy} message={loadingStage} />
    </div >
  )
}
