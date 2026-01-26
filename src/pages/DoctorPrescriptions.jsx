import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../app/context/AuthContext.jsx";
import {
  listPrescriptions,
  createPrescription,
  updatePrescription,
  deletePrescription,
} from "../services/prescriptions";

export default function DoctorPrescriptions() {
  const { patientUid } = useParams();
  const { user } = useAuth();
  const doctorUid = user?.uid;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // formulario simple MVP
  const [medicamentoNombre, setMedicamentoNombre] = useState("");
  const [dosis, setDosis] = useState("");
  const [intervaloHoras, setIntervaloHoras] = useState(8);
  const [cantidadDias, setCantidadDias] = useState(7);
  const [fechaInicio, setFechaInicio] = useState("");

  async function reload() {
    setLoading(true);
    const list = await listPrescriptions(patientUid);
    setItems(list);
    setLoading(false);
  }

  useEffect(() => {
    reload();
  }, [patientUid]);

  async function handleCreate(e) {
    e.preventDefault();
    await createPrescription(patientUid, {
      doctorUid,
      patientUid,
      medicamentoNombre,
      dosis,
      intervaloHoras: Number(intervaloHoras),
      cantidadDias: Number(cantidadDias),
      fechaInicioTratamiento: fechaInicio,
      estado: "activa",
    });
    setMedicamentoNombre("");
    setDosis("");
    setIntervaloHoras(8);
    setCantidadDias(7);
    setFechaInicio("");
    await reload();
  }

  async function handleDelete(prescriptionId) {
    if (!confirm("¿Eliminar esta receta?")) return;

    try {
      await deletePrescription(patientUid, prescriptionId);
      setItems((prev) => prev.filter((x) => x.id !== prescriptionId));
    } catch (e) {
      console.error(e);
      alert(e.message);
    }
  }

  async function handleQuickEdit(id) {
    await updatePrescription(patientUid, id, { estado: "finalizada" });
    await reload();
  }

  return (
    <div>
      <h1>Gestionar recetas</h1>
      <p><strong>Paciente UID:</strong> {patientUid}</p>

      <h2>Crear receta</h2>
      <form onSubmit={handleCreate} style={{ display: "grid", gap: 10, maxWidth: 520 }}>
        <label>
          Medicamento
          <input value={medicamentoNombre} onChange={(e) => setMedicamentoNombre(e.target.value)} required />
        </label>

        <label>
          Dosis
          <input value={dosis} onChange={(e) => setDosis(e.target.value)} required placeholder="Ej: 1 comprimido" />
        </label>

        <label>
          Intervalo (horas)
          <input type="number" value={intervaloHoras} onChange={(e) => setIntervaloHoras(e.target.value)} min={1} required />
        </label>

        <label>
          Duración (días)
          <input type="number" value={cantidadDias} onChange={(e) => setCantidadDias(e.target.value)} min={1} required />
        </label>

        <label>
          Fecha inicio
          <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} required />
        </label>

        <button type="submit">Guardar receta</button>
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
              <strong>{r.medicamentoNombre}</strong> — {r.dosis} — cada {r.intervaloHoras}h — {r.cantidadDias} días
            </div>

            <div>
              Inicio: {r.fechaInicioTratamiento} | Estado: <strong>{r.estado}</strong>
            </div>

            <div
              style={{
                display: "flex",
                gap: 10,
                marginTop: 6,
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                onClick={() => handleQuickEdit(r.id)}
              >
                Marcar finalizada
              </button>

              <button
                type="button"
                onClick={() => handleDelete(r.id)}
              >
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
