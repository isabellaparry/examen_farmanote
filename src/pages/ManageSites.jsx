import { useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../services/firebase";
import { createSiteDoc, toggleSiteStatus } from "../services/sites";

export default function ManageSites() {
  // FORMULARIO
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [loadingSites, setLoadingSites] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // LISTADO
  const [items, setItems] = useState([]);
  const [qName, setQName] = useState("");

  async function loadSites() {
    try {
      setLoadingSites(true);
      const colRef = collection(db, "sites");
      const snap = await getDocs(colRef);
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setItems(list);
    } catch (err) {
      setError(err?.message ?? "Error al cargar las sucursales.");
    } finally {
      setLoadingSites(false);
    }
  }

  useEffect(() => {
    loadSites();
  }, []);

  const filtered = useMemo(() => {
    const search = qName.trim().toLowerCase();
    if (!search) return items;

    return items.filter((s) =>
      (s.name || "").toLowerCase().includes(search)
    );
  }, [items, qName]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      await createSiteDoc({
        name: name.trim(),
        address: address.trim(),
      });

      setName("");
      setAddress("");
      setSuccess("Sucursal registrada correctamente.");

      await loadSites();
    } catch (err) {
      setError(err?.message ?? "Error al registrar la sucursal.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 24 }}>
      <h1>Gestión de sucursales</h1>

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
          <h2 style={{ marginTop: 0 }}>Registrar sucursal</h2>

          <form
            onSubmit={handleSubmit}
            style={{ display: "grid", gap: 12 }}
          >
            <label>
              Nombre
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </label>

            <label>
              Dirección
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </label>

            <button disabled={submitting} type="submit">
              {submitting ? "Registrando..." : "Registrar sucursal"}
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
          <h2 style={{ marginTop: 0 }}>Listado de sucursales</h2>

          <div style={{ marginBottom: 12, maxWidth: 420 }}>
            <label>
              Buscar por nombre
              <input
                value={qName}
                onChange={(e) => setQName(e.target.value)}
                placeholder="Nombre sucursal"
              />
            </label>
          </div>

          {loadingSites ? (
            <p>Cargando...</p>
          ) : filtered.length === 0 ? (
            <p>No hay sucursales registradas.</p>
          ) : (
            <ul style={{ paddingLeft: 18, margin: 0 }}>
              {filtered.map((s) => (
                <li key={s.id} style={{ marginBottom: 10 }}>
                  <div>
                    <strong>{s.name}</strong> — {s.address}
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