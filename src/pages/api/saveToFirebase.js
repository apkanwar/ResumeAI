// saveToFireBase.js
import { collection, addDoc } from "firebase/firestore";
import { db } from '@/lib/firebaseConfig';

const saveToFireBase = async (formData, collectionName) => {
    try {
        const docRef = await addDoc(collection(db, collectionName), {
            ...formData,
            createdAt: new Date().toISOString()
        });

        console.log("Document written with ID: ", docRef.id);
        return docRef;
    } catch (error) {
        console.error("Error adding document to Firestore: ", error.message);
        throw new Error("Failed to save data to Firestore");
    }
};

export default saveToFireBase;