import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import {
  registerCandidate,
  registerRecruiter,
} from "../../api/auth";

import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import {
  AuthShell,
  FieldLabel,
  FormError,
  PasswordField,
  RoleSelector,
} from "../../pages/auth/AuthShell";

export default function Register() {
  const navigate = useNavigate();

  const [role, setRole] = useState<"CANDIDATE" | "RECRUITER">("CANDIDATE");

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      if (role === "CANDIDATE") {
        await registerCandidate(form);
      } else {
        await registerRecruiter(form);
      }

      toast.success("Registration successful");

      navigate("/");
    } catch {
      setError("Registration failed. Please check your details and try again.");
      toast.error("Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Create your account
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Join TalentSync as a candidate or a recruiter.
        </p>
      </div>

      <RoleSelector value={role} onChange={setRole} />

      <form onSubmit={handleRegister} className="mt-6 space-y-5">
        {error && <FormError message={error} />}

        <div>
          <FieldLabel htmlFor="reg-name">Full name</FieldLabel>
          <Input
            id="reg-name"
            name="fullName"
            autoComplete="name"
            placeholder="Your full name"
            value={form.fullName}
            onChange={handleChange}
            required
            className="h-11"
          />
        </div>

        <div>
          <FieldLabel htmlFor="reg-email">Email</FieldLabel>
          <Input
            id="reg-email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            required
            className="h-11"
          />
        </div>

        <div>
          <FieldLabel htmlFor="reg-phone">Phone</FieldLabel>
          <Input
            id="reg-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="Phone number"
            value={form.phone}
            onChange={handleChange}
            className="h-11"
          />
        </div>

        <div>
          <FieldLabel htmlFor="reg-password">Password</FieldLabel>
          <PasswordField
            id="reg-password"
            name="password"
            autoComplete="new-password"
            placeholder="Create a password"
            value={form.password}
            onChange={handleChange}
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
              Creating account...
            </>
          ) : (
            "Create account"
          )}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link
          to="/"
          className="font-medium text-indigo-600 hover:text-indigo-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-sm"
        >
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}