import { useEffect, useState } from "react";
import { auth } from "@/lib/firebaseConfig";
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";
import { CloudUpload, Home } from "@mui/icons-material";
import Link from "next/link";
import { useRouter } from "next/router";
import { getUserProfile, saveUserProfile, bootstrapProfileAfterSignIn } from "@/lib/firebase-profile";
import Inputs_Select from "./select";

export default function SignInPill() {
    const [currentUser, setCurrentUser] = useState(null);
    const router = useRouter();

    const [showProfile, setShowProfile] = useState(false);
    const [profile, setProfile] = useState({
        targetRole: "",
        seniority: "",
        industries: [],
        mustHaveKeywords: [],
        niceToHaveKeywords: [],
        locations: [],
        notes: "",
    });
    const [savingProfile, setSavingProfile] = useState(false);
    const [profileError, setProfileError] = useState("");

    const openProfile = async () => {
        try {
            setProfileError("");
            const p = await getUserProfile();
            if (p) {
                setProfile({
                    targetRole: p.targetRole || "",
                    seniority: p.seniority || "",
                    industries: Array.isArray(p.industries) ? p.industries : [],
                    mustHaveKeywords: Array.isArray(p.mustHaveKeywords) ? p.mustHaveKeywords : [],
                    niceToHaveKeywords: Array.isArray(p.niceToHaveKeywords) ? p.niceToHaveKeywords : [],
                    locations: Array.isArray(p.locations) ? p.locations : [],
                    notes: p.notes || "",
                });
            }
            setShowProfile(true);
        } catch (e) {
            setProfileError(e?.message || "Failed to load profile");
            setShowProfile(true);
        }
    };

    const closeProfile = () => { setShowProfile(false); };

    const handleProfileChange = (field, value) => {
        setProfile(prev => ({ ...prev, [field]: value }));
    };

    const handleProfileSave = async (e) => {
        e?.preventDefault?.();
        try {
            setSavingProfile(true);
            setProfileError("");
            const payload = {
                ...profile,
                industries: toArray(profile.industries),
                mustHaveKeywords: toArray(profile.mustHaveKeywords),
                niceToHaveKeywords: toArray(profile.niceToHaveKeywords),
                locations: toArray(profile.locations),
            };
            await saveUserProfile(payload);
            setShowProfile(false);
        } catch (e) {
            setProfileError(e?.message || "Failed to save profile");
        } finally {
            setSavingProfile(false);
        }
    };

    function toArray(v) {
        if (Array.isArray(v)) return v;
        if (typeof v === 'string') return v.split(',').map(s => s.trim()).filter(Boolean);
        return [];
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, setCurrentUser);
        return () => unsubscribe();
    }, []);

    const handleGoogleSignIn = async () => {
        try {
            await signInWithPopup(auth, new GoogleAuthProvider());
            await bootstrapProfileAfterSignIn();
            console.log('Current User', currentUser)
        } catch (error) {
            console.error("Google sign-in error:", error);
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Sign out error:", error);
        }
    };

    return (
        <div className="pt-24 py-8 max-w-5xl mx-auto rounded-full flex justify-center">
            {currentUser ? (
                <div className="flex flex-row gap-4">
                    {router.pathname === '/uploads' ? (
                        <>
                            <div
                                onClick={openProfile}
                                role="button"
                                tabIndex={0}
                                title="Click to edit profile"
                                className="flex items-center gap-4 bg-artic-blue rounded-full p-2 font-headings font-medium cursor-pointer hover:ring-2 hover:ring-offset-2 hover:ring-top-orange"
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') openProfile(); }}
                            >
                                <img src={currentUser.photoURL} alt="User Avatar" className="rounded-full h-8 w-8" />
                                <span>{currentUser.displayName || currentUser.email}</span>
                                <button onClick={(e) => { e.stopPropagation(); handleSignOut(); }} className="ml-4 px-6 py-1 bg-plum/90 text-white rounded-full hover:bg-plum font-main">
                                    Sign Out
                                </button>
                            </div>
                            <div className="flex items-center gap-4 bg-artic-blue rounded-full p-2 font-headings font-medium">
                                <Link href={'/'} title="Home" className="p-1 pt-0.5 text-white rounded-full hover:bg-gray-300 font-main">
                                    <Home color="warning" />
                                </Link>
                            </div>
                        </>
                    ) : (
                        <>
                            <div
                                onClick={openProfile}
                                role="button"
                                tabIndex={0}
                                title="Click to edit profile"
                                className="flex items-center gap-4 bg-artic-blue rounded-full p-2 font-headings font-medium cursor-pointer hover:ring-2 hover:ring-offset-2 hover:ring-top-orange"
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') openProfile(); }}
                            >
                                <img src={currentUser.photoURL} alt="User Avatar" className="rounded-full h-8 w-8" />
                                <span>{currentUser.displayName || currentUser.email}</span>
                                <button onClick={(e) => { e.stopPropagation(); handleSignOut(); }} className="ml-4 px-6 py-1 bg-plum/90 text-white rounded-full hover:bg-plum font-main">
                                    Sign Out
                                </button>
                            </div>
                            <div className="flex items-center gap-4 bg-artic-blue rounded-full p-2 font-headings font-medium">
                                <Link href={'/uploads'} title="Uploads" className="p-1 pt-0.5 text-white rounded-full hover:bg-gray-300 font-main">
                                    <CloudUpload color="warning" />
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            ) : (
                <div className="flex flex-row gap-4">
                    {router.pathname === '/uploads' && (
                        <div className="flex items-center gap-4 bg-artic-blue rounded-full p-2 font-headings font-medium">
                            <Link href={'/'} title="Home" className="p-1 pt-0.5 text-white rounded-full hover:bg-gray-300 font-main">
                                <Home color="warning" />
                            </Link>
                        </div>
                    )}
                    <div className="flex flex-row bg-artic-blue rounded-full w-fit gap-2 p-1 font-headings font-medium">
                        <button onClick={handleGoogleSignIn}
                            className="flex flex-row justify-center gap-2 bg-google rounded-full font-main p-[2px]">
                            <span className="bg-white rounded-full flex items-center gap-2 px-4 py-1 hover:bg-gray-100 w-full">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-5 w-5">
                                    <path fill="#4285F4" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.6 30.47 0 24 0 14.63 0 6.4 5.38 2.56 13.22l7.98 6.19C12.43 13.24 17.74 9.5 24 9.5z" />
                                    <path fill="#34A853" d="M46.5 24.5c0-1.58-.14-3.09-.39-4.5H24v9h12.65c-.55 2.96-2.23 5.47-4.72 7.16l7.24 5.63C43.74 38.44 46.5 31.96 46.5 24.5z" />
                                    <path fill="#FBBC05" d="M10.53 28.41A14.48 14.48 0 0 1 9.5 24c0-1.52.26-2.98.74-4.36l-7.98-6.19C.82 16.76 0 20.29 0 24c0 3.71.82 7.24 2.26 10.55l8.27-6.14z" />
                                    <path fill="#EA4335" d="M24 48c6.48 0 11.91-2.13 15.88-5.81l-7.24-5.63c-2.01 1.35-4.59 2.14-8.64 2.14-6.26 0-11.57-3.74-13.46-9.03l-8.27 6.14C6.4 42.62 14.63 48 24 48z" />
                                </svg>
                                Sign in with Google
                            </span>
                        </button>
                    </div>
                </div>
            )}


            {showProfile && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/40" onClick={closeProfile} />
                    <div className="relative z-10 w-full max-w-xl rounded-xl bg-white p-5 shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold font-headings">Edit Profile</h2>
                            <button onClick={closeProfile} className="text-2xl leading-none">×</button>
                        </div>

                        {profileError && (
                            <div className="mb-3 rounded-md border border-red-200 bg-red-50 p-2 text-red-700">{profileError}</div>
                        )}

                        <form onSubmit={handleProfileSave} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-medium text-sm font-headings">Target Role</label>
                                    <input
                                        type="text"
                                        className="font-main block w-full outline-none border-0 p-3 bg-gray-200 text-custom-black ring-1 ring-inset ring-transparent placeholder:text-gray-600 placeholder:italic focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 rounded-lg"
                                        value={profile.targetRole}
                                        onChange={(e) => handleProfileChange('targetRole', e.target.value)}
                                        placeholder="e.g., Frontend Engineer"
                                    />
                                </div>
                                <div>
                                    <label className="block font-medium text-sm font-headings">Seniority</label>
                                    <Inputs_Select
                                        id={"seniority"}
                                        value={profile.seniority}
                                        onChange={(val) => handleProfileChange('seniority', val)}
                                        content={[
                                            { name: 'Junior', value: 'junior' },
                                            { name: 'Mid', value: 'mid' },
                                            { name: 'Senior', value: 'senior' },
                                            { name: 'Lead', value: 'lead' },
                                        ]}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block font-medium text-sm font-headings">Industries (comma-separated)</label>
                                <input
                                    type="text"
                                    className="font-main block w-full outline-none border-0 p-3 bg-gray-200 text-custom-black ring-1 ring-inset ring-transparent placeholder:text-gray-600 placeholder:italic focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 rounded-lg"
                                    value={Array.isArray(profile.industries) ? profile.industries.join(', ') : profile.industries}
                                    onChange={(e) => handleProfileChange('industries', e.target.value)}
                                    placeholder="e.g., fintech, saas"
                                />
                            </div>
                            <div>
                                <label className="block font-medium text-sm font-headings">Must-Have Keywords (comma-separated)</label>
                                <input
                                    type="text"
                                    className="font-main block w-full outline-none border-0 p-3 bg-gray-200 text-custom-black ring-1 ring-inset ring-transparent placeholder:text-gray-600 placeholder:italic focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 rounded-lg"
                                    value={Array.isArray(profile.mustHaveKeywords) ? profile.mustHaveKeywords.join(', ') : profile.mustHaveKeywords}
                                    onChange={(e) => handleProfileChange('mustHaveKeywords', e.target.value)}
                                    placeholder="e.g., React, TypeScript, CI/CD"
                                />
                            </div>
                            <div>
                                <label className="block font-medium text-sm font-headings">Nice-to-Have Keywords (comma-separated)</label>
                                <input
                                    type="text"
                                    className="font-main block w-full outline-none border-0 p-3 bg-gray-200 text-custom-black ring-1 ring-inset ring-transparent placeholder:text-gray-600 placeholder:italic focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 rounded-lg"
                                    value={Array.isArray(profile.niceToHaveKeywords) ? profile.niceToHaveKeywords.join(', ') : profile.niceToHaveKeywords}
                                    onChange={(e) => handleProfileChange('niceToHaveKeywords', e.target.value)}
                                    placeholder="e.g., GraphQL, Next.js"
                                />
                            </div>
                            <div>
                                <label className="block font-medium text-sm font-headings">Preferred Locations (comma-separated)</label>
                                <input
                                    type="text"
                                    className="font-main block w-full outline-none border-0 p-3 bg-gray-200 text-custom-black ring-1 ring-inset ring-transparent placeholder:text-gray-600 placeholder:italic focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 rounded-lg"
                                    value={Array.isArray(profile.locations) ? profile.locations.join(', ') : profile.locations}
                                    onChange={(e) => handleProfileChange('locations', e.target.value)}
                                    placeholder="e.g., Toronto, Remote"
                                />
                            </div>
                            <div>
                                <label className="block font-medium text-sm font-headings">Notes</label>
                                <textarea
                                    className="resize-none font-main block w-full outline-none border-0 p-3 bg-gray-200 text-custom-black ring-1 ring-inset ring-transparent placeholder:text-gray-600 placeholder:italic focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 rounded-lg"
                                    rows={3}
                                    value={profile.notes}
                                    onChange={(e) => handleProfileChange('notes', e.target.value)}
                                    placeholder="Any preferences or context for employer fit"
                                />
                            </div>

                            <div className="mt-4 flex justify-end gap-2 font-main font-medium">
                                <button type="button" onClick={closeProfile} className="text-dm-black rounded-full py-1 px-6 hover:bg-gray-300 transition-opacity duration-300 w-fit bg-gray-100 border border-dm-black">Cancel</button>
                                <button type="submit" disabled={savingProfile} className="bg-plum/90 border border-plum/90 text-white rounded-full py-1 px-6 hover:bg-plum transition-opacity duration-300 w-fit">
                                    {savingProfile ? 'Saving…' : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}