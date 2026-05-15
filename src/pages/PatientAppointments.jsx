import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../app/context/AuthContext.jsx";
import { listPatientAppointments } from "../services/appointments";
import { listSites } from "../services/sites";
import { listDoctors } from "../services/doctors";
import {
  getAppointmentDisplayStatus,
  getAppointmentStatusLabel,
} from "../utils/appointment";

export default function PatientAppointments() {
  const { user } = useAuth();
  const patientUid = user?.uid;

  const [items, setItems] = useState([]);
  const [sites, setSites] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filter, setFilter] = useState("all");

  async function loadData() {
    if (!patientUid) return;

    try {
      setLoading(true);
      setError("");

      const [appointmentsList, sitesList, doctorsList] = await Promise.all([
        listPatientAppointments(patientUid),
        listSites(),
        listDoctors(),
      ]);

      setItems(appointmentsList);
      setSites(sitesList);
      setDoctors(doctorsList);
    } catch (err) {
      console.error("Load patient appointments error:", err);
      setError(err?.message ?? "Error al cargar las citas.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [patientUid]);

  const siteMap = useMemo(() => {
    return sites.reduce((acc, site) => {
      acc[site.id] = site;
      return acc;
    }, {});
  }, [sites]);

  const doctorMap = useMemo(() => {
    return doctors.reduce((acc, doctor) => {
      acc[doctor.id] = doctor;
      return acc;
    }, {});
  }, [doctors]);

  const filteredItems = useMemo(() => {
    if (filter === "all") return items;

    return items.filter((appointment) => {
      const displayStatus = getAppointmentDisplayStatus(appointment);
      return displayStatus === filter;
    });
  }, [items, filter]);

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <h1>Mis citas médicas</h1>

      <div style={{ maxWidth: 360 }}>
        <label>
          Filtrar por estado
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{ marginLeft: 8 }}
          >
            <option value="all">Todas</option>
            <option value="scheduled">Citadas</option>
            <option value="cancelled">Canceladas</option>
            <option value="past">Pasadas</option>
          </select>
        </label>
      </div>

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {loading ? (
        <p>Cargando citas...</p>
      ) : filteredItems.length === 0 ? (
        <p>No hay citas médicas para mostrar.</p>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {filteredItems.map((appointment) => {
            const displayStatus = getAppointmentDisplayStatus(appointment);
            const site = siteMap[appointment.siteUid];
            const doctor = doctorMap[appointment.doctorUid];

            return (
              <article
                key={appointment.id}
                style={{
                  border: "1px solid rgba(0,0,0,0.08)",
                  borderRadius: 12,
                  padding: 16,
                  background: "white",
                }}
              >
                <h2 style={{ marginTop: 0, marginBottom: 8 }}>
                  Cita médica
                </h2>

                <p>
                  <strong>Doctor:</strong>{" "}
                  {doctor?.displayName || "Doctor no encontrado"}
                </p>

                <p>
                  <strong>Fecha:</strong> {appointment.date}
                </p>

                <p>
                  <strong>Hora:</strong> {appointment.time}
                </p>

                <p>
                  <strong>Sede:</strong>{" "}
                  {site
                    ? `${site.name} — ${site.address}`
                    : appointment.siteUid}
                </p>

                <p>
                  <strong>Estado:</strong>{" "}
                  {getAppointmentStatusLabel(displayStatus)}
                </p>

                {appointment.notes && (
                  <p>
                    <strong>Notas:</strong> {appointment.notes}
                  </p>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}