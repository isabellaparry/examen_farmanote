import { db } from "./firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export async function authorizeDoctor({ patientUid, doctorUid, patientDisplayName, patientRutNormalized }) {
  if (!patientUid || !doctorUid) throw new Error("Faltan UIDs para autorizar.");

  const safeName = patientDisplayName ?? "";
  const safeRut = patientRutNormalized ?? "";

  // 1) patients/{patientUid}/allowedDoctors/{doctorUid}
  const ref1 = doc(db, "patients", patientUid, "allowedDoctors", doctorUid);
    try {
    await setDoc(ref1, { active: true, authorizedAt: serverTimestamp() }, { merge: true });
    console.log("OK allowedDoctors");
  } catch (e) {
    console.error("FAIL allowedDoctors", e);
    throw e;
  }

  // 2) doctors/{doctorUid}/authorizedPatients/{patientUid}
  const ref2 = doc(db, "doctors", doctorUid, "authorizedPatients", patientUid);
    try {
      await setDoc(
      ref2,
      {
        active: true,
        patientUid,
        patientDisplayName: safeName,
        patientRutNormalized: safeRut,
        authorizedAt: serverTimestamp(),
      },
      { merge: true }
    );
    console.log("OK authorizedPatients");
  } catch (e) {
    console.error("FAIL authorizedPatients", e);
    throw e;
  }
}

