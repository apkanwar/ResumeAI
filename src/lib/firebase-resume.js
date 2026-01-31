import { auth, db } from '@/lib/firebaseConfig';
import {
    getStorage, ref, uploadBytes, getDownloadURL
} from 'firebase/storage';
import {
    collection, query, where, orderBy, getDocs,
    doc, getDoc, setDoc, deleteDoc, addDoc, serverTimestamp, updateDoc
} from 'firebase/firestore';


// Add Doc to Firestore and Upload File to Storage
export async function saveToFirebase(file, options = {}) {
    if (!file) throw new Error('No file provided');
    const user = auth.currentUser;
    if (!user) throw new Error('Not signed in');

    const storage = getStorage();
    const filename = file.name;
    const storagePath = `resumes/${user.uid}/${filename}`;
    const storageRef = ref(storage, storagePath);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    const fileObj = {
        name: filename,
        url: downloadURL,
        path: storagePath,
    };

    const docData = {
        userId: user.uid,
        file: fileObj,
        status: 'uploaded',
        createdAt: serverTimestamp(),
        ...options,
    };
    const docRef = await addDoc(collection(db, 'resumes'), docData);
    return { id: docRef.id, file: fileObj };
}

// Fetch user upload data from Firestore
export async function getUserUploads() {
    const user = auth.currentUser;
    if (!user) throw new Error('Not signed in');

    const q = query(
        collection(db, 'resumes'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// Delete resume and document
export async function deleteResume(id) {
    const user = auth.currentUser;
    if (!user) throw new Error('Not signed in');
    if (!id) throw new Error('Missing id');

    const resumeRef = doc(db, 'resumes', id);
    const snap = await getDoc(resumeRef);
    if (!snap.exists()) return;

    const archivedRef = doc(db, 'archived', id);
    await setDoc(archivedRef, {
        ...snap.data(),
        archivedAt: serverTimestamp()
    });
    await deleteDoc(resumeRef);
}

// Delete selected resume and document
export async function deleteSelected(items = []) {
    for (const it of items) {
        if (!it || !it.id) continue;
        await deleteResume(it.id);
    }
}

// Update Firestore Document with Parsed Sections

// 3) Save parsed schema to the same Firestore document and mark as parsed
export async function saveParsedSections(id, parsed) {
    if (!id) throw new Error('Missing resume id');
    return await updateDoc(doc(db, 'resumes', id), {
        status: 'parsed',
        analysis: {
            sections: {
                contact: parsed.contact || {},
                education: parsed.education || '',
                skills: parsed.skills || [],
                skillsByCategory: parsed.skillsByCategory || {},
                experience: parsed.experience || [],
                references: parsed.references || ''
            }
        },
        updatedAt: serverTimestamp()
    });
}
