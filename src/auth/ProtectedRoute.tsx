import { Navigate } from "react-router-dom";
import { useAuth } from "./useAuth";

interface Props {
  children: React.ReactNode;
  role?: "CANDIDATE" | "RECRUITER";
}

export default function ProtectedRoute({
  children,
  role,
}: Props) {
  const { user, isLoading } = useAuth();

  // Wait until authentication is restored from localStorage
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm text-muted-foreground">
          Loading...
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}