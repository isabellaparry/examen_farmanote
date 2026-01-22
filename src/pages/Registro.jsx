import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerWithEmail } from '../services/auth';
import { createUserProfile } from '../services/users';
import { normalizeRut } from '../utils/rut';
import { createPatientDoc } from '../services/patients';
import { createDoctorDoc } from '../services/doctors';

export default function Registro() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [displayName, setDisplayName] = useState("");
  const [rut, setRut] = useState("");
  const [role, setRole] = useState("patient"); // "doctor" | "patient"

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await registerWithEmail(email, password);

      const rutNormalized = normalizeRut(rut);

      await createUserProfile({
        uid: user.uid,
        email: user.email,
        displayName: displayName.trim(),
        rutNormalized,
        role,
      });

      if (role === "patient") {
        await createPatientDoc({ uid: user.uid, displayName: displayName.trim(), rutNormalized, email: user.email });
      }

      if (role === "doctor") {
        await createDoctorDoc({ uid: user.uid, displayName: displayName.trim(), rutNormalized, email: user.email });
      }

      // Redirigir según rol
      navigate(role === "doctor" ? "/doctor" : "/paciente", { replace: true });
    } catch (err) {
      setError(err?.message ?? "Error al registrar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1>Registro</h1>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12, maxWidth: 460 }}>
        <label>
          Nombre
          <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
        </label>

        <label>
          RUT
          <input value={rut} onChange={(e) => setRut(e.target.value)} required placeholder="12.345.678-K" />
        </label>

        <label>
          Rol
          <select value={role} onChange={(e) => setRole(e.target.value)} required>
            <option value="patient">Paciente</option>
            <option value="doctor">Doctor</option>
          </select>
        </label>

        <label>
          Correo
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </label>

        <label>
          Contraseña
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            minLength={6}
          />
        </label>

        <button disabled={loading} type="submit">
          {loading ? "Registrando..." : "Registrarse"}
        </button>

        {error && <p style={{ color: "crimson" }}>{error}</p>}
      </form>

      <p style={{ marginTop: 12 }}>
        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
      </p>
    </div>
  );
}
