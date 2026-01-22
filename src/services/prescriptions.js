import { db } from "./firebase";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";

export async function listPrescriptions(patientUid) {
  const colRef = collection(db, "patients", patientUid, "prescriptions");
  const q = query(colRef, orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function createPrescription(patientUid, payload) {
  const colRef = collection(db, "patients", patientUid, "prescriptions");
  const ref = await addDoc(colRef, {
    ...payload,
    patientUid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updatePrescription(patientUid, prescriptionId, payload) {
  const ref = doc(db, "patients", patientUid, "prescriptions", prescriptionId);
  await updateDoc(ref, { ...payload, updatedAt: serverTimestamp() });
}

export async function deletePrescription(patientUid, prescriptionId) {
  const ref = doc(db, "patients", patientUid, "prescriptions", prescriptionId);
  await deleteDoc(ref);
}
