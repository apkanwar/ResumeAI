import { useEffect, useState } from "react";
import { auth } from "@/lib/firebaseConfig";
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";
import { CloudUpload, Home } from "@mui/icons-material";
import Link from "next/link";
import { useRouter } from "next/router";

export default function SignInPill() {
    const [currentUser, setCurrentUser] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, setCurrentUser);
        return () => unsubscribe();
    }, []);

    const handleGoogleSignIn = async () => {
        try {
            await signInWithPopup(auth, new GoogleAuthProvider());
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
                            <div className="flex items-center gap-4 bg-artic-blue rounded-full p-2 font-headings font-medium">
                                <Link href={'/'} title="Home" className="p-1 pt-0.5 text-white rounded-full hover:bg-gray-300 font-main">
                                    <Home color="warning" />
                                </Link>
                            </div>
                            <div className="flex items-center gap-4 bg-artic-blue rounded-full p-2 font-headings font-medium">
                                <img src={currentUser.photoURL} alt="User Avatar" className="rounded-full h-8 w-8" />
                                <span>{currentUser.displayName || currentUser.email}</span>
                                <button onClick={handleSignOut} className="ml-4 px-6 py-1 bg-plum/90 text-white rounded-full hover:bg-plum font-main">
                                    Sign Out
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="flex items-center gap-4 bg-artic-blue rounded-full p-2 font-headings font-medium">
                                <img src={currentUser.photoURL} alt="User Avatar" className="rounded-full h-8 w-8" />
                                <span>{currentUser.displayName || currentUser.email}</span>
                                <button onClick={handleSignOut} className="ml-4 px-6 py-1 bg-plum/90 text-white rounded-full hover:bg-plum font-main">
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
        </div>
    );
}