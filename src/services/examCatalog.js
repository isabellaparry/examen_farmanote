import {
  collection,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";

import { db } from "./firebase";

export async function listActiveExamCatalog() {
  const colRef = collection(db, "examCatalog");
  const q = query(colRef, orderBy("name", "asc"));

  const snap = await getDocs(q);

  return snap.docs
    .map((d) => ({
      id: d.id,
      ...d.data(),
    }))
    .filter((exam) => exam.isActive !== false);
}