import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../app/context/AuthContext.jsx";
import { getMyPrescription } from "../services/patientPrescriptions.js";

export default function PatientPrescriptionDetail() {
  const { id } = useParams(); // prescriptionId
  const { user } = useAuth();
  const patientUid = user?.uid;

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!patientUid || !id) return;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const data = await getMyPrescription(patientUid, id);
        setItem(data);
      } catch (err) {
        console.error("Load prescription detail error:", err);
        setError(err?.message ?? "Error al cargar el detalle de la receta.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [patientUid, id]);

  function getStatusLabel(status) {
    const labels = {
      active: "Activa",
      completed: "Finalizada",
      activa: "Activa",
      finalizada: "Finalizada",
    };

    return labels[status] ?? status ?? "Sin estado";
  }

  if (loading) return <p>Cargando...</p>;

  if (error) {
    return (
      <div>
        <p style={{ color: "crimson" }}>{error}</p>
        <Link to="/paciente/recetas">Volver</Link>
      </div>
    );
  }

  if (!item) {
    return (
      <div>
        <p>No se encontró la receta.</p>
        <Link to="/paciente/recetas">Volver</Link>
      </div>
    );
  }

  const medicationName = item.medicationName ?? item.medicamentoNombre;
  const dosage = item.dosage ?? item.dosis;
  const intervalHours = item.intervalHours ?? item.intervaloHoras;
  const durationDays = item.durationDays ?? item.cantidadDias;
  const startDate = item.startDate ?? item.fechaInicioTratamiento;
  const issueDate = item.issueDate ?? item.fechaEmision;
  const status = item.status ?? item.estado;
  const instructions = item.instructions ?? item.indicaciones;

  return (
    <div style={{ maxWidth: 720 }}>
      <h1>Detalle de receta</h1>

      <div
        style={{
          border: "1px solid rgba(0,0,0,0.12)",
          padding: 16,
          borderRadius: 10,
        }}
      >
        <p>
          <strong>Medicamento:</strong> {medicationName}
        </p>

        <p>
          <strong>Dosis:</strong> {dosage}
        </p>

        <p>
          <strong>Intervalo:</strong> cada {intervalHours} horas
        </p>

        <p>
          <strong>Duración:</strong> {durationDays} días
        </p>

        <p>
          <strong>Inicio tratamiento:</strong> {startDate}
        </p>

        <p>
          <strong>Estado:</strong> {getStatusLabel(status)}
        </p>

        <p>
          <strong>Fecha de emisión:</strong>{" "}
          {issueDate || "No registrada"}
        </p>

        <p>
          <strong>Firmada:</strong> {item.isSigned ? "Sí" : "No"}
        </p>

        {item.signatureUrl && (
          <div style={{ marginTop: 8 }}>
            <p style={{ marginBottom: 4 }}>
              <strong>Firma del médico:</strong>
            </p>

            <img
              src={item.signatureUrl}
              alt="Firma del médico"
              style={{
                maxWidth: 180,
                maxHeight: 80,
                objectFit: "contain",
                border: "1px solid rgba(0,0,0,0.08)",
                borderRadius: 8,
                padding: 4,
                background: "#fff",
              }}
            />
          </div>
        )}

        <hr style={{ margin: "16px 0" }} />

        <p style={{ margin: 0, opacity: 0.9 }}>
          <strong>Indicaciones:</strong>{" "}
          {instructions || "No se registraron indicaciones adicionales."}
        </p>
      </div>

      <div style={{ marginTop: 12 }}>
        <Link to="/paciente/recetas">← Volver a Mis recetas</Link>
      </div>
    </div>
  );
}