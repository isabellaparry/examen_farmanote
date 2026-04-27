import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { app } from "./firebase";

const storage = getStorage(app);

export async function uploadDoctorSignature(file, identifier) {
  if (!file) return null;

  const safeIdentifier = identifier.replace(/[^a-zA-Z0-9]/g, "_");
  const storageRef = ref(
    storage,
    `doctor-signatures/${safeIdentifier}_${Date.now()}`
  );

  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);

  return url;
}