import { db } from "./firebase";
import { collection, query, where, getDocs, limit } from "firebase/firestore";

export async function findDoctorByRut(rutNormalized) {
  const q = query(
    collection(db, "doctors"),
    where("rutNormalized", "==", rutNormalized),
    limit(1)
  );

  const snap = await getDocs(q);
  if (snap.empty) return null;

  const docSnap = snap.docs[0];
  return { uid: docSnap.id, ...docSnap.data() };
}
