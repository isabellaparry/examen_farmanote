import { useEffect, useMemo, useState } from "react";
import { normalizeRut, isValidRut } from "../utils/rut";
import {
  createDoctorByAdmin,
  listDoctors,
  toggleDoctorStatus,
} from "../services/admin";
import { uploadDoctorSignature } from "../services/storage";
import { listSites } from "../services/sites";

export default function ManageDoctors() {
  // FORMULARIO
  const [displayName, setDisplayName] = useState("");
  const [rut, setRut] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signatureUrl, setSignatureUrl] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [togglingId, setTogglingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [sites, setSites] = useState([]);
  const [selectedSiteUids, setSelectedSiteUids] = useState([]);
  const [loadingSites, setLoadingSites] = useState(true);

  // LISTADO
  const [items, setItems] = useState([]);
  const [qName, setQName] = useState("");

  function getSiteNames(siteUids = []) {
    return siteUids
      .map((siteUid) => sites.find((s) => s.id === siteUid)?.name)
      .filter(Boolean)
      .join(", ");
  }

  async function loadSites() {
    try {
      setLoadingSites(true);
      const list = await listSites();

      // Solo mostramos sedes activas
      const activeSites = list.filter((site) => site.isActive !== false);

      setSites(activeSites);
    } catch (err) {
      console.error("Load sites error:", err);
      setError(err?.message ?? "Error al cargar las sucursales.");
    } finally {
      setLoadingSites(false);
    }
  }

  async function loadDoctors() {
    try {
      setLoadingDoctors(true);
      setError("");
      const list = await listDoctors();
      setItems(list);
    } catch (err) {
      setError(err?.message ?? "Error al cargar los doctores.");
    } finally {
      setLoadingDoctors(false);
    }
  }

  useEffect(() => {
    loadDoctors();
    loadSites();
  }, []);

  const filtered = useMemo(() => {
    const search = qName.trim().toLowerCase();
    if (!search) return items;

    return items.filter((d) =>
      (d.displayName || "").toLowerCase().includes(search)
    );
  }, [items, qName]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      if (!isValidRut(rut)) {
        setError("El RUT ingresado no es válido.");
        setSubmitting(false);
        return;
      }

      if (selectedSiteUids.length === 0) {
        setError("Debes seleccionar al menos una sucursal.");
        setSubmitting(false);
        return;
      }

      const rutNormalized = normalizeRut(rut);

      await createDoctorByAdmin({
        displayName: displayName.trim(),
        rutNormalized,
        email: email.trim(),
        password,
        siteUids: selectedSiteUids,
        signatureUrl: signatureUrl.trim() || null,
      });

      setDisplayName("");
      setRut("");
      setEmail("");
      setPassword("");
      setSelectedSiteUids([]);
      setSignatureUrl("");

      setSuccess("Doctor registrado correctamente.");
      await loadDoctors();
      
    } catch (err) {
      console.error("Create doctor error:", err);
      setError(err?.message ?? "Error al registrar el doctor.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleDoctor(doctorId, currentStatus) {
    try {
      setError("");
      setSuccess("");
      setTogglingId(doctorId);

      await toggleDoctorStatus(doctorId, !currentStatus);

      setSuccess(
        !currentStatus
          ? "Doctor activado correctamente."
          : "Doctor desactivado correctamente."
      );

      await loadDoctors();
    } catch (err) {
      console.error("Toggle doctor error:", err);
      setError(err?.message ?? "Error al actualizar el estado del doctor.");
    } finally {
      setTogglingId(null);
    }
  }

  function handleToggleSite(siteUid) {
    setSelectedSiteUids((prev) => {
      if (prev.includes(siteUid)) {
        return prev.filter((id) => id !== siteUid);
      }

      return [...prev, siteUid];
    });
  }

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <h1>Gestión de doctores</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(280px, 460px) 1fr",
          gap: 24,
          alignItems: "start",
        }}
      >
        {/* FORMULARIO */}
        <section
          style={{
            border: "1px solid rgba(0,0,0,0.08)",
            borderRadius: 12,
            padding: 16,
          }}
        >
          <h2 style={{ marginTop: 0 }}>Registrar doctor</h2>

          <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
            <label>
              Nombre
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
            </label>

            <label>
              RUT
              <input
                value={rut}
                onChange={(e) => setRut(e.target.value)}
                required
                placeholder="12.345.678-K"
              />
            </label>

            <label>
              Correo
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </label>

            <label>
              URL de la firma
              <input
                type="url"
                value={signatureUrl}
                onChange={(e) => setSignatureUrl(e.target.value)}
                placeholder="https://..."
              />
            </label>

            <fieldset
              style={{
                border: "1px solid rgba(0,0,0,0.12)",
                borderRadius: 8,
                padding: 12,
              }}
            >
              <legend>Sucursales</legend>

              {loadingSites ? (
                <p>Cargando sucursales...</p>
              ) : sites.length === 0 ? (
                <p>No hay sucursales activas registradas.</p>
              ) : (
                <div style={{ display: "grid", gap: 8 }}>
                  {sites.map((site) => (
                    <label
                      key={site.id}
                      style={{ display: "flex", gap: 8, alignItems: "center" }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedSiteUids.includes(site.id)}
                        onChange={() => handleToggleSite(site.id)}
                      />
                      <span>
                        <strong>{site.name}</strong> — {site.address}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </fieldset>

            <label>
              Contraseña temporal
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                minLength={6}
              />
            </label>

            <button disabled={submitting} type="submit">
              {submitting ? "Registrando..." : "Registrar doctor"}
            </button>

            {error && <p style={{ color: "crimson", margin: 0 }}>{error}</p>}
            {success && <p style={{ color: "green", margin: 0 }}>{success}</p>}
          </form>
        </section>

        {/* LISTADO */}
        <section
          style={{
            border: "1px solid rgba(0,0,0,0.08)",
            borderRadius: 12,
            padding: 16,
          }}
        >
          <h2 style={{ marginTop: 0 }}>Listado de doctores</h2>

          <div style={{ marginBottom: 12, maxWidth: 420 }}>
            <label>
              Buscar por nombre
              <input
                value={qName}
                onChange={(e) => setQName(e.target.value)}
                placeholder="Nombre doctor"
              />
            </label>
          </div>

          {loadingDoctors ? (
            <p>Cargando...</p>
          ) : filtered.length === 0 ? (
            <p>No hay doctores registrados.</p>
          ) : (
            <ul style={{ paddingLeft: 18, margin: 0 }}>
              {filtered.map((d) => (
                <li key={d.id} style={{ marginBottom: 16 }}>
                  <div>
                    <strong>{d.displayName}</strong> — {d.email}
                  </div>
                  <div>RUT: {d.rutNormalized}</div>
                  <div>Activo: {d.isActive === false ? "No" : "Sí"}</div>

                  <div>
                    Sucursales: {getSiteNames(d.siteUids) || "Sin sucursal asignada"}
                  </div>

                  {d.signatureUrl && (
                    <div style={{ marginTop: 8 }}>
                      <img
                        src={d.signatureUrl}
                        alt={`Firma de ${d.displayName}`}
                        style={{
                          maxWidth: 180,
                          maxHeight: 80,
                          objectFit: "contain",
                          border: "1px solid rgba(0,0,0,0.08)",
                          borderRadius: 8,
                          padding: 4,
                          background: "#fff",
                        }}
                      />
                    </div>
                  )}

                  <div style={{ marginTop: 8 }}>
                    <button
                      type="button"
                      onClick={() =>
                        handleToggleDoctor(d.id, d.isActive !== false)
                      }
                      disabled={togglingId === d.id}
                    >
                      {togglingId === d.id
                        ? "Actualizando..."
                        : d.isActive === false
                        ? "Activar"
                        : "Desactivar"}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}