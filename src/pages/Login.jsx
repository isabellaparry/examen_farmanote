import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginWithEmail } from "../services/auth";
import { useAuth } from "../app/context/AuthContext.jsx";

export default function Login() {
  const navigate = useNavigate();
  const { user, profile, isAuthReady, isProfileLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Si ya hay sesión + perfil, redirige automáticamente
  useEffect(() => {
    if (!isAuthReady || isProfileLoading) return;
    if (user && profile?.role) {
      navigate(profile.role === "doctor" ? "/doctor" : "/paciente", { replace: true });
    }
  }, [user, profile, isAuthReady, isProfileLoading, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await loginWithEmail(email, password);
      // No redirigir aquí. El useEffect se encargará cuando el perfil cargue.
    } catch (err) {
      setError(err?.message ?? "Error al iniciar sesión.");
      setLoading(false);
      return;
    }

    setLoading(false);
  }

  return (
    <div>
      <h1>Login</h1>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12, maxWidth: 420 }}>
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
            autoComplete="current-password"
            minLength={6}
          />
        </label>

        <button className="login-button" disabled={loading} type="submit">
          {loading ? "Ingresando..." : "Iniciar sesión"}
        </button>

        {error && <p style={{ color: "crimson" }}>{error}</p>}
        {isProfileLoading && <p>Cargando perfil...</p>}
      </form>

      <p style={{ marginTop: 12 }}>
        ¿No tienes cuenta? <Link to="/registro">Regístrate</Link>
      </p>
    </div>
  );
}
