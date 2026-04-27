import { db } from "./firebase";
import { collection, addDoc, serverTimestamp, doc, updateDoc } from "firebase/firestore";

export async function createSiteDoc({ name, address }) {
  const ref = await addDoc(collection(db, "sites"), {
    name,
    address,
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return ref.id;
}

export async function deactivateSiteDoc(siteUid) {
  const ref = doc(db, "sites", siteUid);
  await updateDoc(ref, {
    isActive: false,
    updatedAt: serverTimestamp(),
  });
}