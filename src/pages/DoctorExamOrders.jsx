import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";

import { db } from "../services/firebase";
import { useAuth } from "../app/context/AuthContext.jsx";
import { listActiveExamCatalog } from "../services/examCatalog";
import {
  createExamOrder,
  listDoctorExamOrdersByPatient,
} from "../services/examOrders";

export default function DoctorExamOrders() {
  const { patientUid } = useParams();
  const { user } = useAuth();
  const doctorUid = user?.uid;

  const [examCatalog, setExamCatalog] = useState([]);
  const [selectedExamCodes, setSelectedExamCodes] = useState([]);
  const [orders, setOrders] = useState([]);

  const [notes, setNotes] = useState("");
  const [signatureUrl, setSignatureUrl] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const selectedExams = useMemo(() => {
    return examCatalog
      .filter((exam) => selectedExamCodes.includes(exam.code))
      .map((exam) => ({
        code: exam.code,
        name: exam.name,
      }));
  }, [examCatalog, selectedExamCodes]);

  async function loadDoctor() {
    if (!doctorUid) return;

    const ref = doc(db, "doctors", doctorUid);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      setSignatureUrl(snap.data().signatureUrl || null);
    }
  }

  async function loadData() {
    if (!patientUid || !doctorUid) return;

    try {
      setLoading(true);
      setError("");

      const [catalogList, orderList] = await Promise.all([
        listActiveExamCatalog(),
        listDoctorExamOrdersByPatient(patientUid, doctorUid),
      ]);

      setExamCatalog(catalogList);
      setOrders(orderList);

      setExamCatalog(catalogList);
      setOrders(orderList);
    } catch (err) {
      console.error("Load exam orders error:", err);
      setError(err?.message ?? "Error al cargar las órdenes de exámenes.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDoctor();
    loadData();
  }, [patientUid, doctorUid]);

  function handleToggleExam(code) {
    setSelectedExamCodes((prev) => {
      if (prev.includes(code)) {
        return prev.filter((item) => item !== code);
      }

      return [...prev, code];
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      if (!doctorUid) {
        setError("No se encontró el médico autenticado.");
        return;
      }

      if (selectedExams.length === 0) {
        setError("Debes seleccionar al menos un examen.");
        return;
      }

      await createExamOrder(patientUid, {
        doctorUid,
        issueDate: new Date().toISOString().split("T")[0],
        exams: selectedExams,
        notes: notes.trim(),
        signatureUrl: signatureUrl || null,
      });

      setSelectedExamCodes([]);
      setNotes("");
      setSuccess("Orden de exámenes creada correctamente.");

      await loadData();
    } catch (err) {
      console.error("Create exam order error:", err);
      setError(err?.message ?? "Error al crear la orden de exámenes.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <p>Cargando órdenes de exámenes...</p>;
  }

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <h1>Órdenes de exámenes</h1>

      <p>
        <strong>Paciente UID:</strong> {patientUid}
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(280px, 460px) 1fr",
          gap: 24,
          alignItems: "start",
        }}
      >
        <section
          style={{
            border: "1px solid rgba(0,0,0,0.08)",
            borderRadius: 12,
            padding: 16,
          }}
        >
          <h2 style={{ marginTop: 0 }}>Crear orden</h2>

          <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
            <fieldset
              style={{
                border: "1px solid rgba(0,0,0,0.12)",
                borderRadius: 8,
                padding: 12,
              }}
            >
              <legend>Exámenes</legend>

              {examCatalog.length === 0 ? (
                <p>No hay exámenes activos en el catálogo.</p>
              ) : (
                <div style={{ display: "grid", gap: 8 }}>
                  {examCatalog.map((exam) => (
                    <label
                      key={exam.id}
                      style={{
                        display: "flex",
                        gap: 8,
                        alignItems: "center",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedExamCodes.includes(exam.code)}
                        onChange={() => handleToggleExam(exam.code)}
                      />
                      <span>
                        <strong>{exam.name}</strong>{" "}
                        <small>({exam.code})</small>
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </fieldset>

            <label>
              Observaciones
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="Ejemplo: venir con 12 horas de ayuno."
              />
            </label>

            {!signatureUrl && (
              <p style={{ color: "crimson", margin: 0 }}>
                Este médico no tiene firma registrada. La orden se creará sin
                firma.
              </p>
            )}

            <button disabled={submitting} type="submit">
              {submitting ? "Creando..." : "Crear orden"}
            </button>

            {error && <p style={{ color: "crimson", margin: 0 }}>{error}</p>}
            {success && <p style={{ color: "green", margin: 0 }}>{success}</p>}
          </form>
        </section>

        <section
          style={{
            border: "1px solid rgba(0,0,0,0.08)",
            borderRadius: 12,
            padding: 16,
          }}
        >
          <h2 style={{ marginTop: 0 }}>Órdenes creadas</h2>

          {orders.length === 0 ? (
            <p>No hay órdenes de exámenes registradas para este paciente.</p>
          ) : (
            <ul style={{ paddingLeft: 18, margin: 0 }}>
              {orders.map((order) => (
                <li key={order.id} style={{ marginBottom: 16 }}>
                  <div>
                    <strong>Fecha de emisión:</strong> {order.issueDate}
                  </div>

                  <div>
                    <strong>Exámenes:</strong>
                    <ul style={{ marginTop: 6 }}>
                      {(order.exams || []).map((exam) => (
                        <li key={exam.code}>
                          {exam.name} <small>({exam.code})</small>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {order.notes && (
                    <div>
                      <strong>Observaciones:</strong> {order.notes}
                    </div>
                  )}

                  <div>
                    <strong>Firmada:</strong>{" "}
                    {order.isSigned ? "Sí" : "No"}
                  </div>

                  {order.signatureUrl && (
                    <div style={{ marginTop: 8 }}>
                      <img
                        src={order.signatureUrl}
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
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}