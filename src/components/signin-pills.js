import { auth } from "@/lib/firebaseConfig";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

export default function SignInPills() {
    const handleGoogleSignIn = async () => {
        try {
            await signInWithPopup(auth, new GoogleAuthProvider());
        } catch (error) {
            console.error("Google sign-in error:", error);
        }
    };

    return (
        <div className="pt-24 py-8 max-w-xs mx-auto rounded-full flex justify-center">
            <div className="flex flex-row bg-artic-blue rounded-full w-fit gap-2 p-1 font-headings font-medium">
                <button onClick={handleGoogleSignIn}
                    className="flex flex-row justify-center gap-2 bg-gradient-to-r from-[#4285F4] via-[#34A853] via-[#FBBC05] to-[#EA4335] rounded-full font-main p-[2px]">
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
    );
}