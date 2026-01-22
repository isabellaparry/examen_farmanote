import { db } from "./firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export async function createPatientDoc({ uid, displayName, rutNormalized, email }) {
  const ref = doc(db, "patients", uid);
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
