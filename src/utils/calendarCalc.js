import { addDays, parseISO, isValid, format } from "date-fns";

export function getTreatmentDaysKeys(prescription) {
  const startDate =
    prescription.startDate ?? prescription.fechaInicioTratamiento;

  const durationDays =
    prescription.durationDays ?? prescription.cantidadDias;

  const start = parseISO(startDate);

  if (!isValid(start)) return [];

  const days = Number(durationDays);

  if (!Number.isFinite(days) || days <= 0) return [];

  const keys = [];

  for (let i = 0; i < days; i++) {
    const d = addDays(start, i);
    keys.push(format(d, "yyyy-MM-dd"));
  }

  return keys;
}

export function buildDayMap(prescriptions) {
  const map = new Map();

  for (const prescription of prescriptions) {
    const keys = getTreatmentDaysKeys(prescription);

    for (const key of keys) {
      if (!map.has(key)) {
        map.set(key, []);
      }

      map.get(key).push(prescription);
    }
  }

  return map;
}