import { useState } from "react";
import { useAuth } from "../app/context/AuthContext.jsx";
import { normalizeRut } from "../utils/rut.js";
import { findDoctorByRut } from "../services/searchDoctors.js";
import { authorizeDoctor } from "../services/allowedDoctors.js";


export default function AuthorizeDoctor() {
  const { user, profile } = useAuth();
  const patientUid = user?.uid;

  const [rut, setRut] = useState("");
  const [found, setFound] = useState(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSearch() {
    setMessage("");
    setFound(null);
    setLoading(true);

    try {
      const rutNormalized = normalizeRut(rut);
      const doctor = await findDoctorByRut(rutNormalized);

      if (!doctor) {
        setMessage("No se encontró un doctor con ese RUT.");
      } else {
        setFound(doctor);
      }
    } catch (e) {
      setMessage("Ocurrió un error al buscar el doctor.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAuthorize() {
    if (!found || !patientUid) return;

    setMessage("");
    setLoading(true);

    try {
      await authorizeDoctor({
        patientUid,
        doctorUid: found.uid,
        patientDisplayName: profile?.displayName,
        patientRutNormalized: profile?.rutNormalized,
      });

      setMessage("Doctor autorizado correctamente ✅");
      setFound(null);
      setRut("");
    } catch (e) {
      console.error("Authorize error:", e);
      setMessage(e?.message || "No se pudo autorizar al doctor (revisar permisos).");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1>Autorizar médico</h1>
      <p>Busca al médico por RUT y autorízalo para acceder a tus recetas.</p>

      <div style={{ display: "grid", gap: 12, maxWidth: 520 }}>
        <label>
          RUT del médico
          <input
            value={rut}
            onChange={(e) => setRut(e.target.value)}
            placeholder="12.345.678-K"
          />
        </label>

        <button className="authorize-button" onClick={handleSearch} disabled={loading || !rut.trim()}>
          {loading ? "Buscando..." : "Buscar"}
        </button>

        {found && (
          <div style={{ border: "1px solid rgba(0,0,0,0.1)", padding: 12, borderRadius: 8 }}>
            <p><strong>Doctor encontrado:</strong></p>
            <p>{found.displayName}</p>
            <p>RUT: {found.rutNormalized}</p>

            <button className="authorize-button" onClick={handleAuthorize} disabled={loading}>
              {loading ? "Autorizando..." : "Autorizar"}
            </button>
          </div>
        )}

        {message && <p>{message}</p>}
      </div>
    </div>
  );
}
