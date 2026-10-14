import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { login as loginApi } from "../../api/auth";
import { useAuth } from "../../auth/useAuth";

import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import {
  AuthShell,
  FieldLabel,
  FormError,
  PasswordField,
  RoleSelector,
} from "../../pages/auth/AuthShell";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [role, setRole] = useState<"CANDIDATE" | "RECRUITER">("CANDIDATE");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await loginApi({
        email,
        password,
      });

      const auth = {
        token: response.token,
        id: response.id,
        fullName: response.fullName,
        email: response.email,
        role: response.role,
      };

      login(auth);

      toast.success("Login successful!");

      if (response.role === "RECRUITER") {
        navigate("/recruiter/dashboard");
      } else {
        navigate("/candidate/dashboard");
      }
    } catch {
      setError("Invalid email or password");
      toast.error("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleGithubLogin = () => {
    window.location.href =
  `${import.meta.env.VITE_API_BASE_URL}/oauth2/authorization/github`;
  };

  return (
    <AuthShell>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Welcome back
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Sign in to continue to your TalentSync account.
        </p>
      </div>

      <RoleSelector value={role} onChange={setRole} />

      <form onSubmit={handleLogin} className="mt-6 space-y-5" noValidate={false}>
        {error && <FormError message={error} />}

        <div>
          <FieldLabel htmlFor="login-email">Email</FieldLabel>
          <Input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            required
            className="h-11"
          />
        </div>

        <div>
          <FieldLabel htmlFor="login-password">Password</FieldLabel>
          <PasswordField
            id="login-password"
            name="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="h-11 w-full bg-indigo-600 text-white hover:bg-indigo-700"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>

      {/* GITHUB — CANDIDATE ONLY */}
      {role === "CANDIDATE" && (
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-slate-400">Or</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="mt-6 h-11 w-full"
            onClick={handleGithubLogin}
          >
            <svg
              viewBox="0 0 24 24"
              className="mr-2 h-4 w-4"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
            </svg>
            Continue with GitHub
          </Button>
        </div>
      )}

      <p className="mt-8 text-center text-sm text-slate-500">
        Don't have an account?{" "}
        <Link
          to="/register"
          className="font-medium text-indigo-600 hover:text-indigo-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-sm"
        >
          Create one
        </Link>
      </p>
    </AuthShell>
  );
}