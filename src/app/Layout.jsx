import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";

export default function Layout() {
  return (
    <div>
      <Navbar />
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
