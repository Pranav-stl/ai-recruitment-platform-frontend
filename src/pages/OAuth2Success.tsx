import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../auth/useAuth";

const OAuth2Success = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const handleOAuthSuccess = async () => {
      try {
        // Get JWT from URL
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");

        if (!token) {
          navigate("/login");
          return;
        }

        // Get current user from backend
        const response = await axios.get(
          "http://localhost:8080/auth/me",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const user = response.data;

        // Convert backend response to your existing AuthUser structure
        const authUser = {
          token: token,
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        };

        // Use your existing authentication system
        login(authUser);

        // Remove token from browser URL
        window.history.replaceState(
          {},
          document.title,
          "/oauth2/success"
        );

        // Redirect according to role
        if (user.role === "RECRUITER") {
          navigate("/recruiter/dashboard");
        } else {
          navigate("/candidate/dashboard");
        }

      } catch (error) {
        console.error("GitHub login failed:", error);
        navigate("/login");
      }
    };

    handleOAuthSuccess();
  }, [login, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <p className="text-lg font-medium">
          Signing you in with GitHub...
        </p>
      </div>
    </div>
  );
};

export default OAuth2Success;