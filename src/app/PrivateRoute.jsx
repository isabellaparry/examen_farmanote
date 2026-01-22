import { Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";

export default function PrivateRoute({ children }) {
  const { user, isAuthReady } = useAuth();

  if (!isAuthReady) {
    return <div style={{ padding: 24 }}>Cargando sesión...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
