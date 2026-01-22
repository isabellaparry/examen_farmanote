import { db } from "./firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

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
