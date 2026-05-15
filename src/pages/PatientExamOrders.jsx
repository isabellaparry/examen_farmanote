import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../app/context/AuthContext.jsx";
import { listPatientExamOrders } from "../services/examOrders";
import { listDoctors } from "../services/doctors";
import { generateExamOrderPdf } from "../utils/pdf";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../services/firebase";

export default function PatientExamOrders() {
  const { user } = useAuth();
  const patientUid = user?.uid;

  const [patientProfile, setPatientProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadData() {
  if (!patientUid) return;

  try {
    setLoading(true);
    setError("");

    const [ordersList, doctorsList, patientSnap] = await Promise.all([
      listPatientExamOrders(patientUid),
      listDoctors(),
      getDoc(doc(db, "patients", patientUid)),
    ]);

    setOrders(ordersList);
    setDoctors(doctorsList);

    if (patientSnap.exists()) {
      setPatientProfile({
        id: patientSnap.id,
        ...patientSnap.data(),
      });
    }
  } catch (err) {
    console.error("Load patient exam orders error:", err);
    setError(err?.message ?? "Error al cargar las órdenes de exámenes.");
  } finally {
    setLoading(false);
  }
}

  useEffect(() => {
    loadData();
  }, [patientUid]);

  const doctorMap = useMemo(() => {
    return doctors.reduce((acc, doctor) => {
      acc[doctor.id] = doctor;
      return acc;
    }, {});
  }, [doctors]);

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <h1>Mis órdenes de exámenes</h1>

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {loading ? (
        <p>Cargando órdenes de exámenes...</p>
      ) : orders.length === 0 ? (
        <p>No tienes órdenes de exámenes registradas.</p>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {orders.map((order) => {
            const doctor = doctorMap[order.doctorUid];

            return (
              <article
                key={order.id}
                style={{
                  border: "1px solid rgba(0,0,0,0.08)",
                  borderRadius: 12,
                  padding: 16,
                  background: "white",
                }}
              >
                <h2 style={{ marginTop: 0, marginBottom: 8 }}>
                  Orden de exámenes
                </h2>

                <p>
                  <strong>Fecha de emisión:</strong> {order.issueDate}
                </p>

                <p>
                  <strong>Médico:</strong>{" "}
                  {doctor?.displayName || "Doctor no encontrado"}
                </p>

                <div>
                  <strong>Exámenes solicitados:</strong>

                  {order.exams?.length > 0 ? (
                    <ul style={{ marginTop: 6 }}>
                      {order.exams.map((exam) => (
                        <li key={exam.code}>
                          {exam.name} <small>({exam.code})</small>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No hay exámenes registrados en esta orden.</p>
                  )}
                </div>

                {order.notes && (
                  <p>
                    <strong>Observaciones:</strong> {order.notes}
                  </p>
                )}

                <p>
                  <strong>Firmada:</strong> {order.isSigned ? "Sí" : "No"}
                </p>

                {order.isSigned && (
                  <button
                    type="button"
                    onClick={() =>
                      generateExamOrderPdf({
                        order,
                        doctor,
                        patient: patientProfile,
                      })
                    }
                  >
                    Exportar PDF
                  </button>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}