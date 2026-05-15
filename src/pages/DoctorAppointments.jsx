import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../app/context/AuthContext.jsx";
import {
  createAppointment,
  listDoctorAppointmentsByPatient,
  cancelAppointment,
} from "../services/appointments";
import { listSites } from "../services/sites";
import {
  getAppointmentDisplayStatus,
  getAppointmentStatusLabel,
} from "../utils/appointment";

export default function DoctorAppointments() {
  const { patientUid } = useParams();
  const { user } = useAuth();
  const doctorUid = user?.uid;

  const [items, setItems] = useState([]);
  const [sites, setSites] = useState([]);

  const [siteUid, setSiteUid] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadAppointments() {
    if (!patientUid || !doctorUid) return;

    try {
      setLoading(true);
      setError("");

      const list = await listDoctorAppointmentsByPatient(patientUid, doctorUid);
      setItems(list);
    } catch (err) {
      console.error("Load appointments error:", err);
      setError(err?.message ?? "Error al cargar las citas.");
    } finally {
      setLoading(false);
    }
  }

  async function loadSites() {
    try {
      const list = await listSites();
      const activeSites = list.filter((site) => site.isActive !== false);
      setSites(activeSites);

      if (activeSites.length > 0) {
        setSiteUid(activeSites[0].id);
      }
    } catch (err) {
      console.error("Load sites error:", err);
      setError(err?.message ?? "Error al cargar las sedes.");
    }
  }

  useEffect(() => {
    loadSites();
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [patientUid, doctorUid]);

  const siteMap = useMemo(() => {
    return sites.reduce((acc, site) => {
      acc[site.id] = site;
      return acc;
    }, {});
  }, [sites]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      if (!siteUid) {
        setError("Debes seleccionar una sede.");
        return;
      }

      if (!date || !time) {
        setError("Debes ingresar fecha y hora.");
        return;
      }

      await createAppointment(patientUid, {
        doctorUid,
        patientUid,
        siteUid,
        date,
        time,
        notes: notes.trim(),
      });

      setDate("");
      setTime("");
      setNotes("");
      setSuccess("Cita registrada correctamente.");

      await loadAppointments();
    } catch (err) {
      console.error("Create appointment error:", err);
      setError(err?.message ?? "Error al registrar la cita.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCancel(appointmentId) {
    const confirmCancel = window.confirm("¿Seguro que deseas cancelar esta cita?");
    if (!confirmCancel) return;

    setError("");
    setSuccess("");
    setCancellingId(appointmentId);

    try {
      await cancelAppointment(patientUid, appointmentId, doctorUid);
      setSuccess("Cita cancelada correctamente.");
      await loadAppointments();
    } catch (err) {
      console.error("Cancel appointment error:", err);
      setError(err?.message ?? "Error al cancelar la cita.");
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <h1>Gestión de citas médicas</h1>

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
          <h2 style={{ marginTop: 0 }}>Registrar cita</h2>

          <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
            <label>
              Sede
              <select
                value={siteUid}
                onChange={(e) => setSiteUid(e.target.value)}
                required
              >
                {sites.length === 0 ? (
                  <option value="">No hay sedes disponibles</option>
                ) : (
                  sites.map((site) => (
                    <option key={site.id} value={site.id}>
                      {site.name} — {site.address}
                    </option>
                  ))
                )}
              </select>
            </label>

            <label>
              Fecha
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </label>

            <label>
              Hora
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </label>

            <label>
              Notas
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Observaciones de la cita"
                rows={4}
              />
            </label>

            <button disabled={submitting} type="submit">
              {submitting ? "Registrando..." : "Registrar cita"}
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
          <h2 style={{ marginTop: 0 }}>Citas registradas</h2>

          {loading ? (
            <p>Cargando citas...</p>
          ) : items.length === 0 ? (
            <p>No hay citas registradas para este paciente.</p>
          ) : (
            <ul style={{ paddingLeft: 18, margin: 0 }}>
              {items.map((appointment) => {
                const displayStatus = getAppointmentDisplayStatus(appointment);
                const site = siteMap[appointment.siteUid];

                return (
                  <li key={appointment.id} style={{ marginBottom: 16 }}>
                    <div>
                      <strong>
                        {appointment.date} a las {appointment.time}
                      </strong>
                    </div>

                    <div>
                      Sede:{" "}
                      {site
                        ? `${site.name} — ${site.address}`
                        : appointment.siteUid}
                    </div>

                    <div>
                      Estado:{" "}
                      <strong>{getAppointmentStatusLabel(displayStatus)}</strong>
                    </div>

                    {appointment.notes && (
                      <div>Notas: {appointment.notes}</div>
                    )}

                    {appointment.status !== "cancelled" &&
                      displayStatus !== "past" && (
                        <div style={{ marginTop: 8 }}>
                          <button
                            type="button"
                            onClick={() => handleCancel(appointment.id)}
                            disabled={cancellingId === appointment.id}
                          >
                            {cancellingId === appointment.id
                              ? "Cancelando..."
                              : "Cancelar cita"}
                          </button>
                        </div>
                      )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}