import { useAuth } from '../app/context/AuthContext.jsx';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const { profile } = useAuth();

  return (
    <div style={{ padding: 24 }}>
      <h1>Panel Administrativo</h1>
      <Link to="/managedoctors">Administrar Doctores</Link>
      <br/>
      <Link to="/managesites">Administrar Sucursales</Link>
      <p><strong>RUT:</strong> {profile?.rutNormalized}</p>
      <p><strong>Rol:</strong> {profile?.role}</p>
    </div>
  );
}
