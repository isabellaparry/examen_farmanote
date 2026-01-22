import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../services/firebase";
import { getUserProfile } from "../../services/users";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setProfile(null);

      if (!firebaseUser) {
        setIsAuthReady(true);
        setIsProfileLoading(false);
        return;
      }

      setIsProfileLoading(true);
      try {
        const p = await getUserProfile(firebaseUser.uid);
        setProfile(p); // puede ser null si aún no existe
      } finally {
        setIsProfileLoading(false);
        setIsAuthReady(true);
      }
    });

    return () => unsub();
  }, []);

  const value = useMemo(
    () => ({ user, profile, isAuthReady, isProfileLoading }),
    [user, profile, isAuthReady, isProfileLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider />");
  return ctx;
}
