import jsPDF from "jspdf";

async function loadImageAsBase64(url) {
  if (!url) return null;

  // Si ya viene como base64/dataURL, se usa directamente
  if (url.startsWith("data:image/")) {
    return url;
  }

  try {
    const response = await fetch(url, {
      mode: "cors",
    });

    if (!response.ok) {
      throw new Error("No se pudo cargar la imagen de firma.");
    }

    const blob = await response.blob();

    return await new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;

      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error loading signature image:", error);
    return null;
  }
}

function addHeader(doc, title) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(title, 20, 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("DocNote", 20, 28);

  doc.line(20, 32, 190, 32);
}

function addSignature(doc, signatureBase64, y) {
  if (!signatureBase64) return;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Firma del profesional:", 20, y);

  function getImageFormat(base64) {
  if (!base64) return "JPEG";

  if (base64.startsWith("data:image/png")) return "PNG";
  if (base64.startsWith("data:image/jpeg")) return "JPEG";
  if (base64.startsWith("data:image/jpg")) return "JPEG";

  return "JPEG";
}

function addSignature(doc, signatureBase64, y) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Firma del profesional:", 20, y);

  if (signatureBase64) {
    const format = getImageFormat(signatureBase64);

    doc.addImage(signatureBase64, format, 20, y + 5, 50, 25);
  } else {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Firma no disponible", 20, y + 15);
  }

  doc.line(20, y + 35, 90, y + 35);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Profesional tratante", 20, y + 40);
}

  doc.line(20, y + 35, 90, y + 35);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Profesional tratante", 20, y + 40);
}

export async function generatePrescriptionPdf({
  prescription,
  doctor,
  patient,
}) {
  const doc = new jsPDF();

  addHeader(doc, "Receta médica");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);

  let y = 45;

  doc.text(`Fecha de emisión: ${prescription.issueDate || "Sin fecha"}`, 20, y);
  y += 10;

  doc.text(`Paciente: ${patient?.displayName || "Paciente"}`, 20, y);
  y += 8;

  doc.text(`RUT paciente: ${patient?.rutNormalized || "No informado"}`, 20, y);
  y += 10;

  doc.text(`Médico: ${doctor?.displayName || "Médico"}`, 20, y);
  y += 8;

  doc.text(`RUT médico: ${doctor?.rutNormalized || "No informado"}`, 20, y);
  y += 14;

  doc.setFont("helvetica", "bold");
  doc.text("Detalle de receta", 20, y);
  y += 10;

  doc.setFont("helvetica", "normal");
  doc.text(`Medicamento: ${prescription.medicationName || ""}`, 20, y);
  y += 8;

  doc.text(`Dosis: ${prescription.dosage || ""}`, 20, y);
  y += 8;

  doc.text(`Intervalo: cada ${prescription.intervalHours} horas`, 20, y);
  y += 8;

  doc.text(`Duración: ${prescription.durationDays} días`, 20, y);
  y += 8;

  doc.text(`Inicio del tratamiento: ${prescription.startDate || ""}`, 20, y);
  y += 8;

  doc.text(`Estado: ${prescription.status || ""}`, 20, y);
  y += 16;

  const signatureBase64 = await loadImageAsBase64(
    prescription.signatureUrl || doctor?.signatureUrl
  );

  addSignature(doc, signatureBase64, y);

  doc.save(`receta-${prescription.issueDate || "docnote"}.pdf`);
}

export async function generateExamOrderPdf({
  order,
  doctor,
  patient,
}) {
  const doc = new jsPDF();

  addHeader(doc, "Orden de exámenes");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);

  let y = 45;

  doc.text(`Fecha de emisión: ${order.issueDate || "Sin fecha"}`, 20, y);
  y += 10;

  doc.text(`Paciente: ${patient?.displayName || "Paciente"}`, 20, y);
  y += 8;

  doc.text(`RUT paciente: ${patient?.rutNormalized || "No informado"}`, 20, y);
  y += 10;

  doc.text(`Médico: ${doctor?.displayName || "Médico"}`, 20, y);
  y += 8;

  doc.text(`RUT médico: ${doctor?.rutNormalized || "No informado"}`, 20, y);
  y += 14;

  doc.setFont("helvetica", "bold");
  doc.text("Exámenes solicitados", 20, y);
  y += 10;

  doc.setFont("helvetica", "normal");

  (order.exams || []).forEach((exam, index) => {
    doc.text(`${index + 1}. ${exam.name} (${exam.code})`, 25, y);
    y += 8;
  });

  y += 6;

  if (order.notes) {
    doc.setFont("helvetica", "bold");
    doc.text("Observaciones:", 20, y);
    y += 8;

    doc.setFont("helvetica", "normal");
    const notesLines = doc.splitTextToSize(order.notes, 160);
    doc.text(notesLines, 20, y);
    y += notesLines.length * 7 + 8;
  }

  const signatureBase64 = await loadImageAsBase64(
    order.signatureUrl || doctor?.signatureUrl
  );

  addSignature(doc, signatureBase64, y);

  doc.save(`orden-examenes-${order.issueDate || "docnote"}.pdf`);
}