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
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}