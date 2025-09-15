// src/lib/requireUser.js
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';

export async function requireUser(req) {
    const authHeader = req.headers.authorization || '';
    const m = authHeader.match(/^Bearer\s+(.+)$/i);
    if (!m) {
        const err = new Error('Missing Bearer token');
        err.status = 401;
        throw err;
    }

    const idToken = m[1];
    let decoded;
    try {
        decoded = await adminAuth.verifyIdToken(idToken);
    } catch {
        const err = new Error('Invalid token');
        err.status = 401;
        throw err;
    }

    // Fetch role from profiles/{uid}
    const snap = await adminDb.collection('profiles').doc(decoded.uid).get();
    const role = String(snap?.data()?.role || 'user').toLowerCase();

    return { uid: decoded.uid, role };
}

export async function requireRole(req, allowed = ['admin']) {
    const me = await requireUser(req);
    if (!allowed.includes(me.role)) {
        const err = new Error('Forbidden');
        err.status = 403;
        throw err;
    }
    return me;
}