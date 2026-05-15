import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "./firebase";

export async function createExamOrder(patientUid, data) {
  if (!patientUid) {
    throw new Error("patientUid es obligatorio para crear una orden.");
  }

  if (!data.doctorUid) {
    throw new Error("doctorUid es obligatorio para crear una orden.");
  }

  if (!Array.isArray(data.exams) || data.exams.length === 0) {
    throw new Error("Debes seleccionar al menos un examen.");
  }

  const colRef = collection(db, "patients", patientUid, "examOrders");

  const docRef = await addDoc(colRef, {
    doctorUid: data.doctorUid,
    patientUid,
    issueDate: data.issueDate,
    exams: data.exams,
    notes: data.notes || "",
    isSigned: Boolean(data.signatureUrl),
    signatureUrl: data.signatureUrl || null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function listDoctorExamOrdersByPatient(patientUid, doctorUid) {
  if (!patientUid || !doctorUid) {
    throw new Error("patientUid y doctorUid son obligatorios.");
  }

  const colRef = collection(db, "patients", patientUid, "examOrders");

  const q = query(
    colRef,
    where("doctorUid", "==", doctorUid),
    orderBy("issueDate", "desc")
  );

  const snap = await getDocs(q);

  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
}

export async function listPatientExamOrders(patientUid) {
  if (!patientUid) {
    throw new Error("patientUid es obligatorio.");
  }

  const colRef = collection(db, "patients", patientUid, "examOrders");

  const q = query(colRef, orderBy("issueDate", "desc"));

  const snap = await getDocs(q);

  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
}