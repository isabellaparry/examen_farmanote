import { useEffect, useMemo, useState } from "react";
import Calendar from "react-calendar";
import { format } from "date-fns";

import { useAuth } from "../app/context/AuthContext.jsx";
import { listMyPrescriptions } from "../services/patientPrescriptions";
import { buildDayMap } from "../utils/calendarCalc";

export default function PatientCalendar() {
  const { user } = useAuth();
  const patientUid = user?.uid;

  const [value, setValue] = useState(new Date());
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Carga recetas del paciente
  useEffect(() => {
    if (!patientUid) return;

    async function load() {
      setLoading(true);
      const list = await listMyPrescriptions(patientUid);
      setPrescriptions(list);
      setLoading(false);
    }

    load();
  }, [patientUid]);

  // Mapa de días -> recetas
  const dayMap = useMemo(() => buildDayMap(prescriptions), [prescriptions]);

  // Selección del día (clave)
  const selectedKey = useMemo(() => format(value, "yyyy-MM-dd"), [value]);
  const selectedItems = dayMap.get(selectedKey) ?? [];

  if (loading) return <p>Cargando calendario...</p>;

  return (
    <div style={{ display: "grid", gap: 18, maxWidth: 900 }}>
      <h1>Calendario de medicamentos</h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 18 }}>
        <Calendar
          onChange={setValue}
          className="farmanote-calendar"
          value={value}
          tileContent={({ date, view }) => {
            if (view !== "month") return null;

            const key = format(date, "yyyy-MM-dd");
            const items = dayMap.get(key);
            if (!items || items.length === 0) return null;

            const actives = items.filter((x) => x.estado === "activa");

            // Si hay recetas activas ese día
            if (actives.length > 0) {
                return (
                <div style={{ fontSize: 12, marginTop: 4 }}>
                    💊 {actives.length}
                </div>
                );
            }

            // Solo recetas finalizadas
            return (
                <div style={{ fontSize: 12, marginTop: 4, opacity: 0.7 }}>
                ⚪ {items.length}
                </div>
            );
          }}

          // Clase opcional para resaltar días con tratamiento
          tileClassName={({ date, view }) => {
            if (view !== "month") return "";
            const key = format(date, "yyyy-MM-dd");
            return dayMap.has(key) ? "has-meds" : "";
          }}
        />

        <div style={{ border: "1px solid rgb(236, 204, 255);", borderRadius: 10, padding: 16 }}>
          <h2 style={{ marginTop: 0 }}>Detalle del día</h2>
          <p>
            <strong>Fecha:</strong> {selectedKey}
          </p>

          {selectedItems.length === 0 ? (
            <p>No hay medicamentos programados para este día.</p>
          ) : (
            <ul style={{ paddingLeft: 18 }}>
              {selectedItems.map((r) => (
                <li key={r.id} style={{ marginBottom: 10 }}>
                  <div>
                    <strong>{r.medicamentoNombre}</strong> — {r.dosis}
                  </div>
                  <div style={{ opacity: 0.9 }}>
                    Intervalo: cada {r.intervaloHoras}h · Duración: {r.cantidadDias} días · Estado:{" "}
                    <strong>{r.estado}</strong>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <style>{`
        .has-meds abbr {
          font-weight: 700;
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
