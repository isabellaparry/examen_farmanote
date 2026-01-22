import { db } from "./firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export async function createUserProfile({ uid, role, rutNormalized, displayName, email }) {
  const ref = doc(db, "users", uid);

  await setDoc(
    ref,
    {
      role, // "doctor" | "patient"
      rutNormalized,
      displayName,
      email,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function getUserProfile(uid) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;
  return { uid, ...snap.data() };
}
