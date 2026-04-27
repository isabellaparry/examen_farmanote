import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { db, app } from "./firebase";

const functions = getFunctions(app);

export async function createDoctorByAdmin({
  displayName,
  rutNormalized,
  email,
  password,
  siteUids = [],
  signatureUrl = null,
}) {
  const callable = httpsCallable(functions, "createDoctorByAdmin");

  const result = await callable({
    displayName: displayName?.trim(),
    rutNormalized,
    email: email?.trim(),
    password,
    siteUids,
    signatureUrl: signatureUrl?.trim() || null,
  });

  return result.data;
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