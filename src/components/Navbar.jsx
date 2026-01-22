import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../app/context/AuthContext.jsx";
import { logout } from "../services/auth";


const linkStyle = ({ isActive }) => ({
  textDecoration: "none",
  padding: "8px 12px",
  borderRadius: 8,
  color: "inherit",
  background: isActive ? "rgba(0,0,0,0.08)" : "transparent",
});

export default function Navbar() {
  const { user, profile, isAuthReady } = useAuth();
  const navigate = useNavigate();
  const homePath =
  profile?.role === "doctor"
    ? "/doctor"
    : profile?.role === "patient"
    ? "/paciente"
    : "/";

  async function handleLogout() {
    await logout();
    navigate("/login");
  }
  return (
    <header>
      <nav
        className="navbar">
        <div style={{ fontWeight: 700 }}>FarmaNote</div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <NavLink to="/login" style={linkStyle}>
            Login
          </NavLink>
          <NavLink to="/registro" style={linkStyle}>
            Registro
          </NavLink>
          {isAuthReady && user && profile && (
            <NavLink to={homePath} style={linkStyle}>
              Inicio
            </NavLink>
          )}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>

          {isAuthReady && user && (
            <button onClick={handleLogout} className="logout-button">Cerrar sesión</button>
          )}
        </div>
      </nav>
    </header>
  );
}
