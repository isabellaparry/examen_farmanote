import { db } from "./firebase";
import { doc,
  setDoc,
  serverTimestamp,
  collection,
  getDocs,
  query,
  orderBy } from "firebase/firestore";

export async function createDoctorDoc({ uid, displayName, rutNormalized, email }) {
  const ref = doc(db, "doctors", uid);
  await setDoc(
    ref,
    {
      displayName,
      rutNormalized,
      email,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function listDoctors() {
  const q = query(collection(db, "doctors"), orderBy("displayName", "asc"));
  const snap = await getDocs(q);

  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
}
