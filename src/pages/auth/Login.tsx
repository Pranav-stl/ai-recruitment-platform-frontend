import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { login as loginApi } from "../../api/auth";
import { useAuth } from "../../auth/useAuth";

import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { Link } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

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
    } catch (error) {
      toast.error("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <Card className="w-full max-w-md p-8 shadow-xl rounded-2xl">
        <h1 className="text-3xl font-bold text-center">
          AI Recruitment Platform
        </h1>

        <p className="text-center text-slate-500 mt-2 mb-8">
          Sign in to continue
        </p>

        <form onSubmit={handleLogin} className="space-y-4">

          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In"}
          </Button>

          <p className="text-center text-sm">
  Don't have an account?{" "}
  <Link
    to="/register"
    className="text-blue-600 hover:underline"
  >
    Register
  </Link>
</p>
        </form>
      </Card>
    </div>
  );
}