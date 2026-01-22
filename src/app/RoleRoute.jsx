import { Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";

export default function RoleRoute({ allowedRole, children }) {
  const { user, profile, isAuthReady, isProfileLoading } = useAuth();

  if (!isAuthReady || isProfileLoading) {
    return <div style={{ padding: 24 }}>Cargando sesión...</div>;
  }

  if (!user) return <Navigate to="/login" replace />;

  // Si el usuario está logueado pero no tiene perfil, lo mandamos a completar registro
  if (!profile) return <Navigate to="/registro" replace />;

  if (allowedRole && profile.role !== allowedRole) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
