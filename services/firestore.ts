import { orderBy, setDoc, Timestamp } from "firebase/firestore";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit as qLimit,
  startAfter as qStartAfter,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "./firebase";

export const getAllDocuments = async (collectionName: string) => {
  try {
    console.log("getAllDocuments called with:", collectionName);
    const colRef = collection(db, collectionName);
    console.log("colRef:", colRef);
    const snapshot = await getDocs(colRef);
    console.log("Firestore getAllDocuments snapshot:", snapshot);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.error("Error in getAllDocuments:", err);
    throw err;
  }
};

export const getDocumentById = async (collectionName: string, id: string) => {
  const docRef = doc(db, collectionName, id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  } else {
    return null;
  }
};

export const addDocument = async (collectionName: string, data: any) => {
  const colRef = collection(db, collectionName);
  const realData = { ...data, createdAt: new Date() }; // Ensure createdAt is a Date object
  const docRef = await addDoc(colRef, realData);
  return { id: docRef.id, ...realData };
};

export const setDocumentById = async (
  collectionName: string,
  id: string,
  data: any
) => {
  const docRef = doc(db, collectionName, id);
  await setDoc(docRef, data);
};

export const updateDocument = async (
  collectionName: string,
  id: string,
  data: any
) => {
  const docRef = doc(db, collectionName, id);
  await updateDoc(docRef, data);
  const updatedDoc = await getDoc(docRef);
  if (updatedDoc.exists()) {
    return { id: updatedDoc.id, ...updatedDoc.data() };
  }
  return { id, ...data };
};

export const deleteDocument = async (collectionName: string, id: string) => {
  const docRef = doc(db, collectionName, id);
  await deleteDoc(docRef);
};

export const queryDocuments = async (
  collectionName: string,
  field: string,
  op: any,
  value: any,
  options?: {
    limit?: number;
    startAfter?: any;
    orderBy?: string;
    orderDirection?: "asc" | "desc";
  }
) => {
  const colRef = collection(db, collectionName);

  let queryConstraints: any[] = [where(field, op, value)];

  if (options?.orderBy) {
    queryConstraints.push(
      orderBy(options.orderBy, options.orderDirection || "asc")
    );
  }

  if (options?.startAfter) {
    let cursorValue;

    if (options.startAfter.createdAt) {
      if (options.startAfter.createdAt instanceof Timestamp) {
        cursorValue = options.startAfter.createdAt;
      } else if (options.startAfter.createdAt instanceof Date) {
        cursorValue = Timestamp.fromDate(options.startAfter.createdAt);
      } else if (options.startAfter.createdAt.seconds) {
        cursorValue = new Timestamp(
          options.startAfter.createdAt.seconds,
          options.startAfter.createdAt.nanoseconds || 0
        );
      } else {
        cursorValue = Timestamp.fromDate(
          new Date(options.startAfter.createdAt)
        );
      }

      queryConstraints.push(qStartAfter(cursorValue));
    }
  }

  if (options?.limit) {
    queryConstraints.push(qLimit(options.limit));
  }

  const q = query(colRef, ...queryConstraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const compoundQueryDocuments = async (
  collectionName: string,
  whereConditions: Array<{ field: string; op: any; value: any }>,
  options?: {
    limit?: number;
    startAfter?: any;
    orderBy?: string;
    orderDirection?: "asc" | "desc";
  }
) => {
  const colRef = collection(db, collectionName);

  let queryConstraints: any[] = [];

  // Add all where conditions
  if (Array.isArray(whereConditions)) {
    whereConditions.forEach((cond) => {
      queryConstraints.push(where(cond.field, cond.op, cond.value));
    });
  }

  if (options?.orderBy) {
    queryConstraints.push(
      orderBy(options.orderBy, options.orderDirection || "asc")
    );
  }

  if (options?.startAfter) {
    let cursorValue;
    if (options.startAfter.createdAt) {
      if (options.startAfter.createdAt instanceof Timestamp) {
        cursorValue = options.startAfter.createdAt;
      } else if (options.startAfter.createdAt instanceof Date) {
        cursorValue = Timestamp.fromDate(options.startAfter.createdAt);
      } else if (options.startAfter.createdAt.seconds) {
        cursorValue = new Timestamp(
          options.startAfter.createdAt.seconds,
          options.startAfter.createdAt.nanoseconds || 0
        );
      } else {
        cursorValue = Timestamp.fromDate(
          new Date(options.startAfter.createdAt)
        );
      }
      queryConstraints.push(qStartAfter(cursorValue));
    }
  }

  if (options?.limit) {
    queryConstraints.push(qLimit(options.limit));
  }

  const q = query(colRef, ...queryConstraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const uploadImageToFirebase = async (uri: string, path: string) => {
  try {
    let blob;

    const response = await fetch(uri);
    blob = await response.blob();

    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error: any) {
    throw new Error("Image upload failed: " + error?.message);
  }
};

export const getSubcollectionDocuments = async (
  parentCollection: string,
  parentDocId: string,
  subcollectionName: string
) => {
  try {
    const subcollectionRef = collection(
      db,
      parentCollection,
      parentDocId,
      subcollectionName
    );
    const snapshot = await getDocs(subcollectionRef);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.error("Error in getSubcollectionDocuments:", err);
    return [];
  }
};

export const updateSubcollectionDocument = async (
  parentCollection: string,
  parentDocId: string,
  subcollectionName: string,
  docId: string,
  data: any
) => {
  const docRef = doc(
    db,
    parentCollection,
    parentDocId,
    subcollectionName,
    docId
  );
  await updateDoc(docRef, data);
  const updatedDoc = await getDoc(docRef);
  if (updatedDoc.exists()) {
    return { id: updatedDoc.id, ...updatedDoc.data() };
  }
  return { id: docId, ...data };
};

// Add this function to /Users/apple/ReactNativeProjects/MealCartRnapp/services/firestore.ts

export const setSubcollectionDocument = async (
  parentCollection: string,
  parentDocId: string,
  subcollectionName: string,
  docId: string,
  data: any
) => {
  const docRef = doc(
    db,
    parentCollection,
    parentDocId,
    subcollectionName,
    docId
  );
  await setDoc(docRef, data);
  return { id: docId, ...data };
};

export const getAllDocumentsWithPagination = async (
  collectionName: string,
  options?: {
    limit?: number;
    startAfter?: any;
    orderBy?: string;
    orderDirection?: "asc" | "desc";
  }
) => {
  const colRef = collection(db, collectionName);

  let queryConstraints: any[] = [];

  if (options?.orderBy) {
    queryConstraints.push(
      orderBy(options.orderBy, options.orderDirection || "asc")
    );
  }

  if (options?.startAfter) {
    let cursorValue;
    if (options.startAfter.createdAt) {
      if (options.startAfter.createdAt instanceof Timestamp) {
        cursorValue = options.startAfter.createdAt;
      } else if (options.startAfter.createdAt instanceof Date) {
        cursorValue = Timestamp.fromDate(options.startAfter.createdAt);
      } else if (options.startAfter.createdAt.seconds) {
        cursorValue = new Timestamp(
          options.startAfter.createdAt.seconds,
          options.startAfter.createdAt.nanoseconds || 0
        );
      } else {
        cursorValue = Timestamp.fromDate(
          new Date(options.startAfter.createdAt)
        );
      }
      queryConstraints.push(qStartAfter(cursorValue));
    }
  }

  if (options?.limit) {
    queryConstraints.push(qLimit(options.limit));
  }

  const q = query(colRef, ...queryConstraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const generateFirebaseId = () => {
  // This creates a Firebase-style auto ID
  return doc(collection(db, "_temp")).id;
};
