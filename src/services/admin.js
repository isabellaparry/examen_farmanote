import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

import { initializeApp, deleteApp } from "firebase/app";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import { db, firebaseConfig } from "./firebase";

export async function createDoctorByAdmin({
  displayName,
  rutNormalized,
  email,
  password,
  siteUids = [],
  signatureUrl = null,
}) {
  const secondaryApp = initializeApp(firebaseConfig, `secondary-${Date.now()}`);
  const secondaryAuth = getAuth(secondaryApp);

  try {
    const userCredential = await createUserWithEmailAndPassword(
      secondaryAuth,
      email.trim(),
      password
    );

    const doctorUid = userCredential.user.uid;
    const now = serverTimestamp();

    await setDoc(doc(db, "users", doctorUid), {
      role: "doctor",
      displayName: displayName.trim(),
      rutNormalized,
      email: email.trim(),
      createdAt: now,
      updatedAt: now,
    });

    await setDoc(doc(db, "doctors", doctorUid), {
      uid: doctorUid,
      displayName: displayName.trim(),
      rutNormalized,
      email: email.trim(),
      siteUids,
      signatureUrl: signatureUrl?.trim() || null,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    return {
      success: true,
      doctorUid,
    };
  } finally {
    await signOut(secondaryAuth).catch(() => {});
    await deleteApp(secondaryApp).catch(() => {});
  }
}

export async function listDoctors() {
  const q = query(collection(db, "doctors"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);

  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
}

export async function toggleDoctorStatus(doctorUid, isActive) {
  const ref = doc(db, "doctors", doctorUid);

  await updateDoc(ref, {
    isActive,
    updatedAt: serverTimestamp(),
  });
}