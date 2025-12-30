// src/lib/firebaseAdmin.js
import * as admin from 'firebase-admin';

let app;
if (!admin.apps.length) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;

    // Normalize newlines if user pasted as single line
    if (privateKey && privateKey.includes('\\n')) {
        privateKey = privateKey.replace(/\\n/g, '\n');
    }

    app = admin.initializeApp({
        credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey,
        }),
    });
} else {
    app = admin.app();
}

export const adminAuth = admin.auth(app);
export const adminDb = admin.firestore(app);
export const adminFieldValue = admin.firestore.FieldValue;
