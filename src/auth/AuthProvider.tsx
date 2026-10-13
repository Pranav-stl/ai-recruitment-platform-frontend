import { useEffect, useState } from "react";
import { AuthContext, type AuthUser } from "./AuthContext";

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const auth = localStorage.getItem("auth");

      if (auth) {
        const parsedUser: AuthUser = JSON.parse(auth);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error("Failed to restore authentication:", error);
      localStorage.removeItem("auth");
    } finally {
      setIsLoading(false);
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
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}