import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";

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

export async function listSites() {
  const q = query(collection(db, "sites"), orderBy("name", "asc"));
  const snap = await getDocs(q);

  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
}

export async function toggleSiteStatus(siteUid, isActive) {
  const ref = doc(db, "sites", siteUid);

  await updateDoc(ref, {
    isActive,
    updatedAt: serverTimestamp(),
  });
}