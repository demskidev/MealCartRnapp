import { setDoc } from 'firebase/firestore';

// services/firestore.ts
// Firestore service for common queries

import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { db } from './firebase';


// Get all documents from a collection
export const getAllDocuments = async (collectionName: string) => {
  try {
    console.log("getAllDocuments called with:", collectionName);
    const colRef = collection(db, collectionName);
    console.log("colRef:", colRef);
    const snapshot = await getDocs(colRef);
    console.log("Firestore getAllDocuments snapshot:", snapshot);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.error("Error in getAllDocuments:", err);
    throw err;
  }
};

// Get a single document by ID
export const getDocumentById = async (collectionName: string, id: string) => {
  const docRef = doc(db, collectionName, id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  } else {
    return null;
  }
};

// Add a new document
export const addDocument = async (collectionName: string, data: any) => {
  const colRef = collection(db, collectionName);
  const docRef = await addDoc(colRef, data);
  return docRef.id;
};


// Set a document by ID (create or overwrite)
export const setDocumentById = async (collectionName: string, id: string, data: any) => {
  const docRef = doc(db, collectionName, id);
  await setDoc(docRef, data);
};

// Update a document
export const updateDocument = async (collectionName: string, id: string, data: any) => {
  const docRef = doc(db, collectionName, id);
  await updateDoc(docRef, data);
};

// Delete a document
export const deleteDocument = async (collectionName: string, id: string) => {
  const docRef = doc(db, collectionName, id);
  await deleteDoc(docRef);
};

// Query documents with a condition
export const queryDocuments = async (collectionName: string, field: string, op: any, value: any) => {
  const colRef = collection(db, collectionName);
  const q = query(colRef, where(field, op, value));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Upload an image to Firebase Storage and return the download URL
export const uploadImageToFirebase = async (uri: string, path: string) => {
  try {
    const storage = getStorage();
    // Convert local URI to blob
    let blob;
  
      const response = await fetch(uri);
      blob = await response.blob();
    
    // Create a storage reference
    const storageRef = ref(storage, path);
    // Upload the blob
    await uploadBytes(storageRef, blob);
    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    throw new Error("Image upload failed: " + error.message);
  }
};
