export const APPOINTMENT_STATUS = {
  SCHEDULED: "scheduled",
  CANCELLED: "cancelled",
};

export const APPOINTMENT_DISPLAY_STATUS = {
  SCHEDULED: "scheduled",
  CANCELLED: "cancelled",
  PAST: "past",
};

export function getAppointmentDateTime(appointment) {
  if (!appointment?.date || !appointment?.time) return null;

  const dateTime = new Date(`${appointment.date}T${appointment.time}`);

  if (Number.isNaN(dateTime.getTime())) return null;

  return dateTime;
}

export function getAppointmentDisplayStatus(appointment) {
  if (!appointment) return APPOINTMENT_DISPLAY_STATUS.SCHEDULED;

  if (appointment.status === APPOINTMENT_STATUS.CANCELLED) {
    return APPOINTMENT_DISPLAY_STATUS.CANCELLED;
  }

  const dateTime = getAppointmentDateTime(appointment);

  if (dateTime && dateTime < new Date()) {
    return APPOINTMENT_DISPLAY_STATUS.PAST;
  }

  return APPOINTMENT_DISPLAY_STATUS.SCHEDULED;
}

export function getAppointmentStatusLabel(status) {
  const labels = {
    scheduled: "Citada",
    cancelled: "Cancelada",
    past: "Pasada",
  };

  return labels[status] ?? status;
}