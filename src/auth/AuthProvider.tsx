import { useEffect, useState } from "react";
import { AuthContext, type AuthUser } from "./AuthContext";

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const auth = localStorage.getItem("auth");

    if (auth) {
      setUser(JSON.parse(auth));
    }
  }, []);

  const login = (authUser: AuthUser) => {
    localStorage.setItem("auth", JSON.stringify(authUser));
    setUser(authUser);
  };

  const logout = () => {
    localStorage.removeItem("auth");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}