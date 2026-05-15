import { useEffect, useMemo, useState } from "react";
import Calendar from "react-calendar";
import { format } from "date-fns";

import { useAuth } from "../app/context/AuthContext.jsx";
import { listMyPrescriptions } from "../services/patientPrescriptions";
import { buildDayMap } from "../utils/calendarCalc";

import { listPatientAppointments } from "../services/appointments";
import { listSites } from "../services/sites";
import { listDoctors } from "../services/doctors";
import {
  getAppointmentDisplayStatus,
  getAppointmentStatusLabel,
} from "../utils/appointment";

export default function PatientCalendar() {
  const { user } = useAuth();
  const patientUid = user?.uid;

  const [value, setValue] = useState(new Date());
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [appointments, setAppointments] = useState([]);
  const [sites, setSites] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [calendarFilter, setCalendarFilter] = useState("all");

  const [error, setError] = useState("");

  useEffect(() => {
    if (!patientUid) return;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const [prescriptionsList, appointmentsList, sitesList, doctorsList] =
          await Promise.all([
            listMyPrescriptions(patientUid),
            listPatientAppointments(patientUid),
            listSites(),
            listDoctors(),
          ]);

        setPrescriptions(prescriptionsList);
        setAppointments(appointmentsList);
        setSites(sitesList);
        setDoctors(doctorsList);
      } catch (err) {
        console.error("Calendar load error:", err);
        setError(err?.message ?? "Error al cargar el calendario.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [patientUid]);

  //const dayMap = useMemo(() => buildDayMap(prescriptions), [prescriptions]);
  const prescriptionDayMap = useMemo(
    () => buildDayMap(prescriptions),
    [prescriptions]
  );

  const appointmentDayMap = useMemo(() => {
    const map = new Map();

    for (const appointment of appointments) {
      if (!appointment.date) continue;

      if (!map.has(appointment.date)) {
        map.set(appointment.date, []);
      }

      map.get(appointment.date).push(appointment);
    }

    return map;
  }, [appointments]);

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

  const selectedKey = useMemo(() => format(value, "yyyy-MM-dd"), [value]);
  const selectedPrescriptions = prescriptionDayMap.get(selectedKey) ?? [];
  const selectedAppointments = appointmentDayMap.get(selectedKey) ?? [];

  if (loading) return <p>Cargando calendario...</p>;

  return (
    <div style={{ display: "grid", gap: 18, maxWidth: 900 }}>
      <h1>Calendario de medicamentos</h1>

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 18 }}>
        <div style={{ maxWidth: 360 }}>
          <label>
            Mostrar:
            <select
              value={calendarFilter}
              onChange={(e) => setCalendarFilter(e.target.value)}
              style={{ marginLeft: 8 }}
            >
              <option value="all">Recetas y citas</option>
              <option value="prescriptions">Solo recetas</option>
              <option value="appointments">Solo citas</option>
            </select>
          </label>
        </div>
        <Calendar
          onChange={setValue}
          className="farmanote-calendar"
          value={value}
          tileContent={({ date, view }) => {
            if (view !== "month") return null;

            const key = format(date, "yyyy-MM-dd");

            const prescriptionsForDay = prescriptionDayMap.get(key) ?? [];
            const appointmentsForDay = appointmentDayMap.get(key) ?? [];

            const showPrescriptions =
              calendarFilter === "all" || calendarFilter === "prescriptions";

            const showAppointments =
              calendarFilter === "all" || calendarFilter === "appointments";

            const hasPrescriptions =
              showPrescriptions && prescriptionsForDay.length > 0;

            const hasAppointments =
              showAppointments && appointmentsForDay.length > 0;

            if (!hasPrescriptions && !hasAppointments) return null;

            return (
              <div
                style={{
                  fontSize: 12,
                  marginTop: 4,
                  display: "flex",
                  justifyContent: "center",
                  gap: 4,
                }}
              >
                {hasPrescriptions && <span title="Medicamentos">💊</span>}
                {hasAppointments && <span title="Citas médicas">📅</span>}
              </div>
            );
          }}
          tileClassName={({ date, view }) => {
            if (view !== "month") return "";

            const key = format(date, "yyyy-MM-dd");

            const hasPrescriptions = prescriptionDayMap.has(key);
            const hasAppointments = appointmentDayMap.has(key);

            if (calendarFilter === "prescriptions") {
              return hasPrescriptions ? "has-meds" : "";
            }

            if (calendarFilter === "appointments") {
              return hasAppointments ? "has-appointments" : "";
            }

            if (hasPrescriptions || hasAppointments) {
              return "has-events";
            }

            return "";
          }}
        />

        <div
          style={{
            border: "1px solid rgb(236, 204, 255)",
            borderRadius: 10,
            padding: 16,
          }}
        >
          <h2 style={{ marginTop: 0 }}>Detalle del día</h2>

          <p>
            <strong>Fecha:</strong> {selectedKey}
          </p>

          {selectedPrescriptions.length === 0 && selectedAppointments.length === 0 ? (
              <p>No hay medicamentos ni citas médicas programadas para este día.</p>
            ) : (
              <div style={{ display: "grid", gap: 16 }}>
                {(calendarFilter === "all" || calendarFilter === "prescriptions") && (
                  <section>
                    <h3>Medicamentos</h3>

                    {selectedPrescriptions.length === 0 ? (
                      <p>No hay medicamentos programados para este día.</p>
                    ) : (
                      <ul style={{ paddingLeft: 18 }}>
                        {selectedPrescriptions.map((r) => {
                          const medicationName = r.medicationName ?? r.medicamentoNombre;
                          const dosage = r.dosage ?? r.dosis;
                          const intervalHours = r.intervalHours ?? r.intervaloHoras;
                          const durationDays = r.durationDays ?? r.cantidadDias;
                          const status = r.status ?? r.estado;

                          return (
                            <li key={r.id} style={{ marginBottom: 10 }}>
                              <div>
                                <strong>{medicationName}</strong> — {dosage}
                              </div>

                              <div style={{ opacity: 0.9 }}>
                                Intervalo: cada {intervalHours}h · Duración:{" "}
                                {durationDays} días · Estado: <strong>{status}</strong>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </section>
                )}

                {(calendarFilter === "all" || calendarFilter === "appointments") && (
                  <section>
                    <h3>Citas médicas</h3>

                    {selectedAppointments.length === 0 ? (
                      <p>No hay citas médicas programadas para este día.</p>
                    ) : (
                      <ul style={{ paddingLeft: 18 }}>
                        {selectedAppointments.map((appointment) => {
                          const displayStatus = getAppointmentDisplayStatus(appointment);
                          const site = siteMap[appointment.siteUid];
                          const doctor = doctorMap[appointment.doctorUid];

                          return (
                            <li key={appointment.id} style={{ marginBottom: 10 }}>
                              <div>
                                <strong>{appointment.time}</strong> —{" "}
                                {doctor?.displayName || "Doctor no encontrado"}
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

                              {appointment.notes && <div>Notas: {appointment.notes}</div>}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </section>
                )}
              </div>
            )}
        </div>
      </div>

      <style>{`
        .has-meds abbr,
        .has-appointments abbr,
        .has-events abbr {
          font-weight: 700;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}