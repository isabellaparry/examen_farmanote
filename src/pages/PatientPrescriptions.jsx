import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../app/context/AuthContext.jsx";
import { listMyPrescriptions } from "../services/patientPrescriptions";

export default function PatientPrescriptions() {
  const { user } = useAuth();
  const patientUid = user?.uid;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("todas"); // todas | activa | finalizada

  useEffect(() => {
    if (!patientUid) return;

    async function load() {
      setLoading(true);
      const list = await listMyPrescriptions(patientUid);
      setItems(list);
      setLoading(false);
    }

    load();
  }, [patientUid]);

  const filtered = useMemo(() => {
    if (filter === "todas") return items;
    return items.filter((r) => r.estado === filter);
  }, [items, filter]);

  return (
    <div>
      <h1>Mis recetas</h1>

      {loading ? (
        <p>Cargando...</p>
      ) : filtered.length === 0 ? (
        <p>No hay recetas para mostrar.</p>
      ) : (
        <ul style={{ paddingLeft: 18 }}>
          {filtered.map((r) => (
            <li key={r.id} className="recipe-card">
              <div>
                <strong>{r.medicamentoNombre}</strong> — {r.dosis}
              </div>
              <div>
                Cada {r.intervaloHoras}h por {r.cantidadDias} días · Inicio: {r.fechaInicioTratamiento} ·{" "}
                <strong>{r.estado}</strong>
              </div>
              <p><Link to={`/paciente/recetas/${r.id}`}>Ver detalle</Link></p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
