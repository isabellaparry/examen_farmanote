import { useAuth } from '../app/context/AuthContext.jsx';
import { Link } from 'react-router-dom';

export default function DoctorDashboard() {
  const { profile } = useAuth();

  return (
    <div style={{ padding: 24 }}>
      <h1>Panel Médico</h1>
      <Link to="/doctor/pacientes">Ver pacientes autorizados</Link>
      <p><strong>Nombre:</strong> {profile?.displayName}</p>
      <p><strong>RUT:</strong> {profile?.rutNormalized}</p>
      <p><strong>Rol:</strong> {profile?.role}</p>
    </div>
  );
}
