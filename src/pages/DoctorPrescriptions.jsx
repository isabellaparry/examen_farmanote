import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, serverTimestamp } from "firebase/firestore";

import { useAuth } from "../app/context/AuthContext.jsx";
import { db } from "../services/firebase";
import {
  listPrescriptions,
  createPrescription,
  updatePrescription,
  deletePrescription,
} from "../services/prescriptions.js";

export default function DoctorPrescriptions() {
  const { patientUid } = useParams();
  const { user } = useAuth();
  const doctorUid = user?.uid;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [signatureUrl, setSignatureUrl] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [medicationName, setMedicationName] = useState("");
  const [dosage, setDosage] = useState("");
  const [intervalHours, setIntervalHours] = useState(8);
  const [durationDays, setDurationDays] = useState(7);
  const [startDate, setStartDate] = useState("");

  async function reload() {
    if (!patientUid) return;

    setLoading(true);
    setError("");

    try {
      const list = await listPrescriptions(patientUid);
      setItems(list);
    } catch (err) {
      console.error("Load prescriptions error:", err);
      setError(err?.message ?? "Error al cargar las recetas.");
    } finally {
      setLoading(false);
    }
  }

  async function loadDoctorSignature() {
    if (!doctorUid) return;

    try {
      const ref = doc(db, "doctors", doctorUid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setSignatureUrl(snap.data().signatureUrl || null);
      }
    } catch (err) {
      console.error("Load doctor signature error:", err);
      setError(err?.message ?? "Error al cargar la firma del doctor.");
    }
  }

  useEffect(() => {
    loadDoctorSignature();
    reload();
  }, [patientUid, doctorUid]);

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      if (!doctorUid) {
        setError("No se encontró el doctor autenticado.");
        return;
      }

      await createPrescription(patientUid, {
        medicationName: medicationName.trim(),
        dosage: dosage.trim(),
        intervalHours: Number(intervalHours),
        durationDays: Number(durationDays),
        startDate,
        issueDate: new Date().toISOString().split("T")[0],
        status: "active",
        doctorUid,
        patientUid,
        isSigned: !!signatureUrl,
        signatureUrl: signatureUrl || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setMedicationName("");
      setDosage("");
      setIntervalHours(8);
      setDurationDays(7);
      setStartDate("");
      setSuccess("Receta guardada correctamente.");

      await reload();
    } catch (err) {
      console.error("Create prescription error:", err);
      setError(err?.message ?? "Error al guardar la receta.");
    }
  }

  async function handleDelete(prescriptionId) {
    if (!confirm("¿Eliminar esta receta?")) return;

    try {
      await deletePrescription(patientUid, prescriptionId);
      setItems((prev) => prev.filter((x) => x.id !== prescriptionId));
      setSuccess("Receta eliminada correctamente.");
    } catch (err) {
      console.error("Delete prescription error:", err);
      setError(err?.message ?? "Error al eliminar la receta.");
    }
  }

  async function handleQuickEdit(id) {
    try {
      await updatePrescription(patientUid, id, {
        status: "completed",
        updatedAt: serverTimestamp(),
      });

      setSuccess("Receta marcada como finalizada.");
      await reload();
    } catch (err) {
      console.error("Update prescription error:", err);
      setError(err?.message ?? "Error al actualizar la receta.");
    }
  }

  return (
    <div>
      <h1>Gestionar recetas</h1>
      <p>
        <strong>Paciente UID:</strong> {patientUid}
      </p>

      <h2>Crear receta</h2>

      <form
        onSubmit={handleCreate}
        style={{ display: "grid", gap: 10, maxWidth: 520 }}
      >
        <label>
          Medicamento
          <input
            value={medicationName}
            onChange={(e) => setMedicationName(e.target.value)}
            required
          />
        </label>

        <label>
          Dosis
          <input
            value={dosage}
            onChange={(e) => setDosage(e.target.value)}
            required
          />
        </label>

        <label>
          Intervalo en horas
          <input
            type="number"
            value={intervalHours}
            onChange={(e) => setIntervalHours(Number(e.target.value))}
            required
            min="1"
          />
        </label>

        <label>
          Duración en días
          <input
            type="number"
            value={durationDays}
            onChange={(e) => setDurationDays(Number(e.target.value))}
            required
            min="1"
          />
        </label>

        <label>
          Fecha de inicio
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </label>

        <button type="submit">Guardar receta</button>

        {error && <p style={{ color: "crimson", margin: 0 }}>{error}</p>}
        {success && <p style={{ color: "green", margin: 0 }}>{success}</p>}
      </form>

      <h2 style={{ marginTop: 20 }}>Recetas existentes</h2>

      {loading ? (
        <p>Cargando...</p>
      ) : items.length === 0 ? (
        <p>No hay recetas aún.</p>
      ) : (
        <ul style={{ paddingLeft: 18 }}>
          {items.map((r) => (
            <li key={r.id} style={{ marginBottom: 12 }}>
              <div>
                <strong>{r.medicationName}</strong> — {r.dosage} — cada{" "}
                {r.intervalHours}h — {r.durationDays} días
              </div>

              <div>
                Inicio: {r.startDate} | Estado:{" "}
                <strong>{r.status}</strong>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 10,
                  marginTop: 6,
                  flexWrap: "wrap",
                }}
              >
                <button type="button" onClick={() => handleQuickEdit(r.id)}>
                  Marcar finalizada
                </button>

                <button type="button" onClick={() => handleDelete(r.id)}>
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}