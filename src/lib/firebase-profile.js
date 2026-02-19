import { auth, db } from '@/lib/firebaseConfig';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

/** Default shape for a new profile */
const DEFAULT_PROFILE = {
    targetRole: '',
    seniority: '',            // 'junior' | 'mid' | 'senior' | 'lead'
    industries: [],           // [string]
    mustHaveKeywords: [],     // [string]
    niceToHaveKeywords: [],   // [string]
    locations: [],            // [string]
    notes: '',
    role: 'user',
    parseTokens: 2,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
};

/** Normalize comma-separated strings to arrays; keep arrays as-is */
function toArray(v) {
    if (Array.isArray(v)) return v;
    if (typeof v === 'string') return v.split(',').map(s => s.trim()).filter(Boolean);
    return [];
}

/** Ensure there is a `profiles/{uid}` doc after sign-up/sign-in */
export async function ensureUserProfile() {
    const user = auth.currentUser;
    if (!user) throw new Error('Not signed in');
    const ref = doc(db, 'profiles', user.uid);
    const snap = await getDoc(ref);
    if (snap.exists()) {
        const data = snap.data();
        if (typeof data.parseTokens !== 'number' || Number.isNaN(data.parseTokens)) {
            await updateDoc(ref, { parseTokens: 2, updatedAt: serverTimestamp() });
            return { ...data, parseTokens: 2 };
        }
        return data;
    }

    const base = {
        ...DEFAULT_PROFILE,
    };

    await setDoc(ref, base, { merge: true });
    return base;
}

/** Get current user's profile (or null if missing) */
export async function getUserProfile(options = {}) {
    const user = auth.currentUser;
    if (!user) throw new Error('Not signed in');
    const { ensureParseTokens = false } = options;
    const ref = doc(db, 'profiles', user.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    const data = snap.data();
    if (ensureParseTokens) {
        const val = data?.parseTokens;
        if (typeof val !== 'number' || Number.isNaN(val)) {
            await updateDoc(ref, { parseTokens: 2, updatedAt: serverTimestamp() });
            return { ...data, parseTokens: 2 };
        }
    }
    return data;
}

/** Create/replace profile explicitly (rarely needed) */
export async function createUserProfile(profile = {}) {
    const user = auth.currentUser;
    if (!user) throw new Error('Not signed in');
    const ref = doc(db, 'profiles', user.uid);
    const payload = {
        ...DEFAULT_PROFILE,
        ...profile,
        industries: toArray(profile.industries),
        mustHaveKeywords: toArray(profile.mustHaveKeywords),
        niceToHaveKeywords: toArray(profile.niceToHaveKeywords),
        locations: toArray(profile.locations),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    };
    await setDoc(ref, payload, { merge: false });
    return true;
}

/** Update/merge profile fields from the modal */
export async function saveUserProfile(profile = {}) {
    const user = auth.currentUser;
    if (!user) throw new Error('Not signed in');
    const ref = doc(db, 'profiles', user.uid);
    const payload = {
        ...profile,
        industries: toArray(profile.industries),
        mustHaveKeywords: toArray(profile.mustHaveKeywords),
        niceToHaveKeywords: toArray(profile.niceToHaveKeywords),
        locations: toArray(profile.locations),
        updatedAt: serverTimestamp(),
    };
    await updateDoc(ref, payload).catch(async (e) => {
        // If the doc doesn't exist yet, create it.
        if (String(e?.message || '').toLowerCase().includes('no document to update')) {
            await setDoc(ref, { ...DEFAULT_PROFILE, ...payload }, { merge: true });
            return;
        }
        throw e;
    });
    return true;
}

/** Optional: call this right after successful sign-in */
export async function bootstrapProfileAfterSignIn() {
    try { await ensureUserProfile(); } catch (_) { /* ignore */ }
}
