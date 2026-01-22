import AppRouter from "./app/AppRouter.jsx";
import { auth, db } from "./services/firebase.js";

export default function App() {
  // Solo para verificar que compila (puedes borrar este console luego)
  console.log("Firebase ready:", !!auth, !!db);

  return <AppRouter />;
}
