import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "./firebase";
import { APPOINTMENT_STATUS } from "../utils/appointment";

export async function createAppointment(patientUid, data) {
  if (!patientUid) {
    throw new Error("patientUid es obligatorio para crear una cita.");
  }

  const colRef = collection(db, "patients", patientUid, "appointments");

  const docRef = await addDoc(colRef, {
    doctorUid: data.doctorUid,
    patientUid,
    siteUid: data.siteUid,
    date: data.date,
    time: data.time,
    notes: data.notes || "",
    status: APPOINTMENT_STATUS.SCHEDULED,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function listDoctorAppointmentsByPatient(patientUid, doctorUid) {
  if (!patientUid || !doctorUid) {
    throw new Error("patientUid y doctorUid son obligatorios.");
  }

  const colRef = collection(db, "patients", patientUid, "appointments");

  const q = query(
    colRef,
    where("doctorUid", "==", doctorUid),
    orderBy("date", "desc")
  );

  const snap = await getDocs(q);

  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
}

export async function listPatientAppointments(patientUid) {
  if (!patientUid) {
    throw new Error("patientUid es obligatorio.");
  }

  const colRef = collection(db, "patients", patientUid, "appointments");

  const q = query(colRef, orderBy("date", "desc"));

  const snap = await getDocs(q);

  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
}

export async function cancelAppointment(patientUid, appointmentId, doctorUid) {
  if (!patientUid || !appointmentId || !doctorUid) {
    throw new Error("patientUid, appointmentId y doctorUid son obligatorios.");
  }

  const ref = doc(db, "patients", patientUid, "appointments", appointmentId);

  await updateDoc(ref, {
    status: APPOINTMENT_STATUS.CANCELLED,
    updatedAt: serverTimestamp(),
  });
}