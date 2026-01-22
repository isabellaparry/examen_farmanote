import { useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "../app/context/AuthContext.jsx";
import { Link } from "react-router-dom";

export default function DoctorPatients() {
  const { user } = useAuth();
  const doctorUid = user?.uid;

  const [items, setItems] = useState([]);
  const [qRut, setQRut] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!doctorUid) return;

    async function load() {
      setLoading(true);
      const colRef = collection(db, "doctors", doctorUid, "authorizedPatients");
      const snap = await getDocs(colRef);
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setItems(list);
      setLoading(false);
    }

    load();
  }, [doctorUid]);

  const filtered = useMemo(() => {
    const x = qRut.trim().toUpperCase();
    if (!x) return items;
    return items.filter((p) => (p.patientRutNormalized || "").includes(x));
  }, [items, qRut]);

  return (
    <div>
      <h1>Pacientes autorizados</h1>

      <div style={{ margin: "12px 0", maxWidth: 420 }}>
        <label>
          Buscar por RUT (dentro de autorizados)
          <input value={qRut} onChange={(e) => setQRut(e.target.value)} placeholder="12345678K" />
        </label>
      </div>

      {loading ? (
        <p>Cargando...</p>
      ) : filtered.length === 0 ? (
        <p>No tienes pacientes autorizados aún.</p>
      ) : (
        <ul style={{ paddingLeft: 18 }}>
          {filtered.map((p) => (
            <li key={p.patientUid} style={{ marginBottom: 10 }}>
              <div>
                <strong>{p.patientDisplayName || "Paciente"}</strong> — {p.patientRutNormalized}
              </div>
              <Link to={`/doctor/pacientes/${p.patientUid}/recetas`}>Gestionar recetas</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
