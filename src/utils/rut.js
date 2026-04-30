// src/utils/rut.js

export function normalizeRut(rut) {
  return String(rut || "")
    .replace(/\./g, "")
    .replace(/-/g, "")
    .replace(/\s/g, "")
    .toUpperCase();
}

export function formatRut(rut) {
  const normalized = normalizeRut(rut);

  if (normalized.length < 2) return normalized;

  const body = normalized.slice(0, -1);
  const dv = normalized.slice(-1);

  return `${body}-${dv}`;
}

export function isValidRut(rut) {
  const normalized = normalizeRut(rut);

  // Debe tener al menos cuerpo + dígito verificador
  if (normalized.length < 2) return false;

  const body = normalized.slice(0, -1);
  const dv = normalized.slice(-1);

  // El cuerpo debe ser numérico
  if (!/^\d+$/.test(body)) return false;

  // El DV debe ser número o K
  if (!/^[0-9K]$/.test(dv)) return false;

  let sum = 0;
  let multiplier = 2;

  for (let i = body.length - 1; i >= 0; i--) {
    sum += Number(body[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const remainder = sum % 11;
  const calculated = 11 - remainder;

  let expectedDv;

  if (calculated === 11) {
    expectedDv = "0";
  } else if (calculated === 10) {
    expectedDv = "K";
  } else {
    expectedDv = String(calculated);
  }

  return dv === expectedDv;
}