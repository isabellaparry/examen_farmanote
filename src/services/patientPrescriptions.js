import { db } from "./firebase";
import { collection, doc, getDoc, getDocs, orderBy, query } from "firebase/firestore";

export async function listMyPrescriptions(patientUid) {
  const colRef = collection(db, "patients", patientUid, "prescriptions");
  const q = query(colRef, orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getMyPrescription(patientUid, prescriptionId) {
  const ref = doc(db, "patients", patientUid, "prescriptions", prescriptionId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}
