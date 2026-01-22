import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../app/context/AuthContext.jsx";
import { getMyPrescription } from "../services/patientPrescriptions";

export default function PatientPrescriptionDetail() {
  const { id } = useParams(); // prescriptionId
  const { user } = useAuth();
  const patientUid = user?.uid;

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patientUid || !id) return;

    async function load() {
      setLoading(true);
      const data = await getMyPrescription(patientUid, id);
      setItem(data);
      setLoading(false);
    }

    load();
  }, [patientUid, id]);

  if (loading) return <p>Cargando...</p>;
  if (!item) {
    return (
      <div>
        <p>No se encontró la receta.</p>
        <Link to="/paciente/recetas">Volver</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720 }}>
      <h1>Detalle de receta</h1>

      <div style={{ border: "1px solid rgba(0,0,0,0.12)", padding: 16, borderRadius: 10 }}>
        <p><strong>Medicamento:</strong> {item.medicamentoNombre}</p>
        <p><strong>Dosis:</strong> {item.dosis}</p>
        <p><strong>Intervalo:</strong> cada {item.intervaloHoras} horas</p>
        <p><strong>Duración:</strong> {item.cantidadDias} días</p>
        <p><strong>Inicio tratamiento:</strong> {item.fechaInicioTratamiento}</p>
        <p><strong>Estado:</strong> {item.estado}</p>

        {"conComida" in item && (
          <p><strong>Con comida:</strong> {item.conComida ? "Sí" : "No"}</p>
        )}

        <hr style={{ margin: "16px 0" }} />

        <p style={{ margin: 0, opacity: 0.9 }}>
          <strong>Indicaciones:</strong>{" "}
          {item.indicaciones ? item.indicaciones : "No se registraron indicaciones adicionales."}
        </p>
      </div>

      <div style={{ marginTop: 12 }}>
        <Link to="/paciente/recetas">← Volver a Mis recetas</Link>
      </div>
    </div>
  );
}
