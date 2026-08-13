import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import {
  registerCandidate,
  registerRecruiter,
} from "../../api/auth";

import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";

export default function Register() {
  const navigate = useNavigate();

  const [role, setRole] = useState<"CANDIDATE" | "RECRUITER">(
    "CANDIDATE"
  );

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setLoading(true);

    try {
      if (role === "CANDIDATE") {
        await registerCandidate(form);
      } else {
        await registerRecruiter(form);
      }

      toast.success("Registration successful");

      navigate("/");
    } catch {
      toast.error("Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <Card className="w-full max-w-md p-8 rounded-2xl shadow-xl">

        <h1 className="text-3xl font-bold text-center">
          Create Account
        </h1>

        <p className="text-center text-slate-500 mt-2 mb-6">
          Join AI Recruitment Platform
        </p>

        <div className="flex gap-2 mb-5">

          <Button
            type="button"
            variant={
              role === "CANDIDATE"
                ? "default"
                : "outline"
            }
            className="flex-1"
            onClick={() => setRole("CANDIDATE")}
          >
            Candidate
          </Button>

          <Button
            type="button"
            variant={
              role === "RECRUITER"
                ? "default"
                : "outline"
            }
            className="flex-1"
            onClick={() => setRole("RECRUITER")}
          >
            Recruiter
          </Button>

        </div>

        <form
          onSubmit={handleRegister}
          className="space-y-4"
        >
          <Input
            name="fullName"
            placeholder="Full Name"
            value={form.fullName}
            onChange={handleChange}
            required
          />

          <Input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <Input
            name="phone"
            placeholder="Phone"
            value={form.phone}
            onChange={handleChange}
          />

          <Input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading
              ? "Creating Account..."
              : "Register"}
          </Button>

          <p className="text-center text-sm">
            Already have an account?{" "}
            <Link
              to="/"
              className="text-blue-600 hover:underline"
            >
              Login
            </Link>
          </p>

        </form>

      </Card>
    </div>
  );
}