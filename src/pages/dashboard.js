import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { onAuthStateChanged, signOut } from "firebase/auth";
import HomeNav from "@/components/home/home-nav";
import FileUpload from "@/components/file-upload";
import ManageUploads from "@/components/manage-uploads";
import StoreContent from "@/components/store-content";
import { auth } from "@/lib/firebaseConfig";
import { getUserProfile } from "@/lib/firebase-profile";
import ProfileForm from "@/components/profile-form";

const NAV_ITEMS = [
  { id: "analyze", label: "Analyze" },
  { id: "results", label: "Results" },
  { id: "profile", label: "Job Profile" },
  { id: "store", label: "Store" },
];

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState("analyze");
  const [currentUser, setCurrentUser] = useState(null);
  const [tokenLabel, setTokenLabel] = useState("--");
  const [authReady, setAuthReady] = useState(false);
  const userName = currentUser?.displayName || currentUser?.email || "Signed in user";
  const userEmail = currentUser?.displayName ? currentUser?.email : null;
  const userInitial = userName?.[0]?.toUpperCase() || "U";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user || null);
      setAuthReady(true);
      if (!user) {
        setTokenLabel("--");
        return;
      }

      (async () => {
        try {
          const profile = await getUserProfile({ ensureParseTokens: true });
          const role = profile?.role ? String(profile.role).toLowerCase() : "user";
          if (role !== "user") {
            setTokenLabel("\u221E");
            return;
          }
          const count = typeof profile?.parseTokens === "number" ? profile.parseTokens : 0;
          setTokenLabel(String(count));
        } catch (err) {
          console.error("Failed to fetch parse tokens", err);
          setTokenLabel("--");
        }
      })();
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setActiveSection("analyze");
    } catch (err) {
      console.error("Sign out error", err);
    }
  };

  const showDashboard = authReady && currentUser;

  return (
    <>
      <Head>
        <title>ResumeAnalyzer - Dashboard</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-[#fff7ed] via-[#fdf2f8] to-[#e0f2fe] text-slate-900">
        <HomeNav variant="dashboard" tokenLabel={tokenLabel} />

        {showDashboard ? (
          <div className="pt-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto grid gap-6 md:grid-cols-[240px_1fr]">
              <aside className="h-fit rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
                <div className="mb-4 flex items-center gap-3 rounded-xl border border-top-orange bg-top-orange/20 p-3">
                  {currentUser?.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={userName}
                      className="h-12 w-12 rounded-full border border-slate-200 object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-lg font-semibold text-slate-700">
                      {userInitial}
                    </div>
                  )}
                  <div
                    className="min-w-0 text-sm font-semibold text-slate-900"
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {userName}
                  </div>
                </div>
                <nav className="flex flex-col gap-2">
                  {NAV_ITEMS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveSection(item.id)}
                      className={`text-left rounded-xl px-4 py-2 font-semibold transition-colors ${
                        activeSection === item.id
                          ? "bg-top-orange/20 text-slate-900"
                          : "text-slate-600 hover:text-top-orange hover:bg-top-orange/10"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-4 text-left rounded-xl px-4 py-2 font-semibold text-slate-600 hover:text-white hover:bg-red-500 transition-colors"
                  >
                    Logout
                  </button>
                </nav>
              </aside>

              <main className="rounded-2xl border border-slate-200 bg-white/70 p-4 md:p-6">
                {activeSection === "analyze" && (
                  <div>
                    <FileUpload panelClassName="bg-white/80 border border-slate-200" />
                  </div>
                )}
                {activeSection === "results" && (
                  <div>
                    <ManageUploads panelClassName="bg-white/80 border border-slate-200" />
                  </div>
                )}
                {activeSection === "profile" && (
                  <div className="mx-4 xl:mx-auto max-w-5xl">
                    <section className="rounded-2xl border border-slate-200 bg-white/80 p-8 font-main">
                      <h2 className="text-2xl font-headings font-semibold">Job Profile</h2>
                      <p className="mt-3 text-slate-700">
                        Update your target role, seniority, keywords, and preferences to personalize your analysis.
                      </p>
                      <div className="mt-6">
                        <ProfileForm showTitle={false} showCancel={false} submitLabel="Save Profile" />
                      </div>
                    </section>
                  </div>
                )}
                {activeSection === "store" && (
                  <div>
                    <StoreContent panelClassName="bg-white/80 border border-slate-200" />
                  </div>
                )}
              </main>
            </div>
          </div>
        ) : (
          <div className="pt-24 px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-6rem)] flex items-center justify-center">
            <div className="max-w-md rounded-2xl border border-slate-200 bg-white/80 p-8 text-center shadow-sm">
              <h2 className="text-2xl font-semibold text-slate-900">Sign in to access your dashboard</h2>
              <p className="mt-3 text-sm text-slate-600">
                Please return to the home page and sign in with Google to continue.
              </p>
              <Link
                href="/"
                className="mt-6 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#f97316] to-[#fb7185] px-6 py-2 text-sm font-semibold text-white shadow-lg hover:shadow-orange-200/60"
              >
                Back to home
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
