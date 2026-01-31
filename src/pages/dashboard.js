import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { ChartBar, CircleQuestionMark, LogOut, ScanSearch, ShoppingBag, UserRound } from "lucide-react";
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import HomeNav from "@/components/navbar";
import { auth } from "@/lib/firebaseConfig";
import { bootstrapProfileAfterSignIn, getUserProfile } from "@/lib/firebase-profile";
import DashboardNavItem from "@/components/dashboard/nav-item";
import DashboardProfileSection from "@/components/dashboard/profile-section";
import DashboardHelpSection from "@/components/dashboard/help-section";
import LogoutConfirmationModal from "@/components/modals/logout-modal";
import FileUpload from "@/components/dashboard/file-upload";
import ManageUploads from "@/components/dashboard/manage-uploads";
import StoreContent from "@/components/dashboard/store-content";

const NAV_ITEMS = [
  { id: "analyze", label: "Analyze", icon: ScanSearch },
  { id: "results", label: "Results", icon: ChartBar },
  { id: "profile", label: "Job Profile", icon: UserRound },
  { id: "store", label: "Store", icon: ShoppingBag },
  { id: "help", label: "Help", icon: CircleQuestionMark },
];

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState("analyze");
  const [currentUser, setCurrentUser] = useState(null);
  const [tokenLabel, setTokenLabel] = useState("--");
  const [authReady, setAuthReady] = useState(false);
  const [signInBusy, setSignInBusy] = useState(false);
  const [signInError, setSignInError] = useState("");
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const userName = currentUser?.displayName || currentUser?.email || "Signed in user";
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
    setLogoutConfirmOpen(false);
    try {
      await signOut(auth);
      setActiveSection("analyze");
    } catch (err) {
      console.error("Sign out error", err);
    }
  };

  const handleLogoutClick = () => {
    setLogoutConfirmOpen(true);
  };

  const handleGoogleSignIn = async () => {
    try {
      setSignInBusy(true);
      setSignInError("");
      await signInWithPopup(auth, new GoogleAuthProvider());
      await bootstrapProfileAfterSignIn();
    } catch (err) {
      console.error("Google sign-in error:", err);
      setSignInError("Unable to sign in. Please try again.");
    } finally {
      setSignInBusy(false);
    }
  };

  const showDashboard = authReady && currentUser;

  return (
    <>
      <Head>
        <title>Resume Analyzer - Dashboard</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-[#fff7ed] via-[#fdf2f8] to-[#e0f2fe] text-slate-900">
        <HomeNav variant="dashboard" tokenLabel={tokenLabel} />

        {showDashboard ? (
          <>
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
                      <DashboardNavItem
                        key={item.id}
                        label={item.label}
                        active={activeSection === item.id}
                        onClick={() => setActiveSection(item.id)}
                        Icon={item.icon}
                      />
                    ))}
                    <DashboardNavItem
                      variant="danger"
                      className="mt-4"
                      label="Logout"
                      onClick={handleLogoutClick}
                      Icon={LogOut}
                    />
                  </nav>
                </aside>

                <main className="rounded-2xl border border-slate-200 bg-white/70 p-4 md:p-6 mb-8">
                  {activeSection === "analyze" && (
                    <FileUpload
                      panelClassName="bg-white/80 border border-slate-200"
                      onAnalysisComplete={() => setActiveSection("results")}
                    />
                  )}
                  {activeSection === "results" && (
                    <ManageUploads panelClassName="bg-white/80 border border-slate-200" />
                  )}
                  {activeSection === "profile" && (
                    <DashboardProfileSection />
                  )}
                  {activeSection === "store" && (
                    <StoreContent panelClassName="bg-white/80 border border-slate-200" />
                  )}
                  {activeSection === "help" && (
                    <DashboardHelpSection onNavigate={setActiveSection} />
                  )}
                </main>
              </div>
            </div>
            <LogoutConfirmationModal
              open={logoutConfirmOpen}
              onCancel={() => setLogoutConfirmOpen(false)}
              onConfirm={handleLogout}
            />
          </>
        ) : (
          <div className="pt-24 px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-6rem)] flex items-center justify-center">
            <div className="max-w-md rounded-2xl border border-slate-200 bg-white/80 p-8 text-center shadow-sm">
              <h2 className="text-2xl font-semibold text-slate-900">Sign in to access your dashboard</h2>
              {signInError && (
                <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">
                  {signInError}
                </div>
              )}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={signInBusy}
                className="mt-6 inline-flex w-full items-center justify-center gap-3 rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-slate-200 transition hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-5 w-5">
                  <path fill="#4285F4" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.6 30.47 0 24 0 14.63 0 6.4 5.38 2.56 13.22l7.98 6.19C12.43 13.24 17.74 9.5 24 9.5z" />
                  <path fill="#34A853" d="M46.5 24.5c0-1.58-.14-3.09-.39-4.5H24v9h12.65c-.55 2.96-2.23 5.47-4.72 7.16l7.24 5.63C43.74 38.44 46.5 31.96 46.5 24.5z" />
                  <path fill="#FBBC05" d="M10.53 28.41A14.48 14.48 0 0 1 9.5 24c0-1.52.26-2.98.74-4.36l-7.98-6.19C.82 16.76 0 20.29 0 24c0 3.71.82 7.24 2.26 10.55l8.27-6.14z" />
                  <path fill="#EA4335" d="M24 48c6.48 0 11.91-2.13 15.88-5.81l-7.24-5.63c-2.01 1.35-4.59 2.14-8.64 2.14-6.26 0-11.57-3.74-13.46-9.03l-8.27 6.14C6.4 42.62 14.63 48 24 48z" />
                </svg>
                {signInBusy ? "Signing in..." : "Sign in with Google"}
              </button>
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
