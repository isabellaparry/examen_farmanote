import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../app/context/AuthContext.jsx";
import { listMyPrescriptions } from "../services/patientPrescriptions";

export default function PatientPrescriptions() {
  const { user } = useAuth();
  const patientUid = user?.uid;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all | active | completed
  const [error, setError] = useState("");

  useEffect(() => {
    if (!patientUid) return;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const list = await listMyPrescriptions(patientUid);
        setItems(list);
      } catch (err) {
        console.error("Load prescriptions error:", err);
        setError(err?.message ?? "Error al cargar las recetas.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [patientUid]);

  const filtered = useMemo(() => {
    if (filter === "all") return items;

    return items.filter((r) => {
      const status = r.status ?? r.estado;
      return status === filter;
    });
  }, [items, filter]);

  function getStatusLabel(status) {
    const labels = {
      active: "Activa",
      completed: "Finalizada",
      activa: "Activa",
      finalizada: "Finalizada",
    };

    return labels[status] ?? status ?? "Sin estado";
  }

  return (
    <div>
      <h1>Mis recetas</h1>

      <div style={{ marginBottom: 16 }}>
        <label>
          Filtrar por estado{" "}
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">Todas</option>
            <option value="active">Activas</option>
            <option value="completed">Finalizadas</option>
          </select>
        </label>
      </div>

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {loading ? (
        <p>Cargando...</p>
      ) : filtered.length === 0 ? (
        <p>No hay recetas para mostrar.</p>
      ) : (
        <ul style={{ paddingLeft: 18 }}>
          {filtered.map((r) => {
            const medicationName = r.medicationName ?? r.medicamentoNombre;
            const dosage = r.dosage ?? r.dosis;
            const intervalHours = r.intervalHours ?? r.intervaloHoras;
            const durationDays = r.durationDays ?? r.cantidadDias;
            const startDate = r.startDate ?? r.fechaInicioTratamiento;
            const status = r.status ?? r.estado;

            return (
              <li key={r.id} className="recipe-card">
                <div>
                  <strong>{medicationName}</strong> — {dosage}
                </div>

                <div>
                  Cada {intervalHours}h por {durationDays} días · Inicio:{" "}
                  {startDate} · <strong>{getStatusLabel(status)}</strong>
                </div>

                <p>
                  <Link to={`/paciente/recetas/${r.id}`}>Ver detalle</Link>
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}