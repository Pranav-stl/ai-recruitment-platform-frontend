
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../auth/useAuth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const OAuth2Success = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const handleOAuthSuccess = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");

      if (!token) {
        navigate("/", { replace: true });
        return;
      }

      try {
        const response = await axios.get(
          `${API_BASE_URL}/auth/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const user = response.data;

        const authUser = {
          token,
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        };

        login(authUser);

        // Remove the token from the visible URL.
        window.history.replaceState(
          {},
          document.title,
          "/oauth2/success"
        );

        if (user.role === "RECRUITER") {
          navigate("/recruiter/dashboard", { replace: true });
        } else {
          navigate("/candidate/dashboard", { replace: true });
        }
      } catch (error) {
        console.error("GitHub login failed:", error);
        navigate("/", { replace: true });
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
