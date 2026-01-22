import { db } from "./firebase";
import { collectionGroup, getDocs, query, where } from "firebase/firestore";

/**
 * Obtiene pacientes que autorizaron al doctor actual.
 * Estrategia: collectionGroup('allowedDoctors') filtrando doctorUid = auth.uid
 * Luego devolvemos patientUid = doc.ref.parent.parent.id
 */
export async function getAuthorizedPatientsForDoctor(doctorUid) {
  const q = query(
    collectionGroup(db, "allowedDoctors"),
    where("__name__", "==", `patients/${"PLACEHOLDER"}/allowedDoctors/${doctorUid}`)
  );
  // ⚠️ Firestore no permite construir __name__ así con wildcard en query.
  // Usaremos estrategia alternativa en 6.1.2 (más simple y real).
}
