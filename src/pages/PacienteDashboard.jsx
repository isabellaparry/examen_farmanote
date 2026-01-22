import { Link } from "react-router-dom";
import { useAuth } from "../app/context/AuthContext.jsx";

export default function PacienteDashboard() {
  const { profile } = useAuth();

  return (
    <div style={{ padding: 24 }}>
      <h1>Panel Paciente</h1>
      <p><strong>Nombre:</strong> {profile?.displayName}</p>

      <Link to="/paciente/recetas">Ver mis recetas</Link> <br />

      <Link to="/paciente/calendario">Ver calendario mensual</Link> <br />

      <Link to="/paciente/autorizar">Autorizar médico por RUT</Link>
    </div>
  );
}
