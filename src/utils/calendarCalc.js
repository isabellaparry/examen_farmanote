import { addDays, parseISO, isValid, format } from "date-fns";

/**
 * Retorna un array de claves "YYYY-MM-DD" que representan los días
 * en los que el paciente está en tratamiento según receta.
 * (No modelamos horas aquí para mantenerlo simple y robusto)
 */
export function getTreatmentDaysKeys(prescription) {
  const start = parseISO(prescription.fechaInicioTratamiento);
  if (!isValid(start)) return [];

  const days = Number(prescription.cantidadDias);
  if (!Number.isFinite(days) || days <= 0) return [];

  const keys = [];
  for (let i = 0; i < days; i++) {
    const d = addDays(start, i);
    keys.push(format(d, "yyyy-MM-dd"));
  }
  return keys;
}

/**
 * Construye un mapa:
 *  { "2026-01-21": [prescriptionA, prescriptionB], ... }
 */
export function buildDayMap(prescriptions) {
  const map = new Map();

  for (const p of prescriptions) {
    const keys = getTreatmentDaysKeys(p);
    for (const k of keys) {
      if (!map.has(k)) map.set(k, []);
      map.get(k).push(p);
    }
  }
  return map;
}
