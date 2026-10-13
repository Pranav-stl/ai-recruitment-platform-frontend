import { useState, type ReactNode } from "react";
import {
  AlertCircle,
  Eye,
  EyeOff,
  FileSearch,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";

import { Input } from "../../components/ui/input";

type Role = "CANDIDATE" | "RECRUITER";

export function Brand({ light = false }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm">
        <Sparkles className="h-5 w-5" aria-hidden="true" />
      </div>
      <span
        className={`text-lg font-semibold tracking-tight ${
          light ? "text-white" : "text-slate-900"
        }`}
      >
        TalentSync
      </span>
    </div>
  );
}

const features = [
  {
    icon: FileSearch,
    title: "AI resume matching",
    text: "Resumes are scored against each role automatically.",
  },
  {
    icon: Target,
    title: "Intelligent skill analysis",
    text: "See exactly where a profile fits and where it falls short.",
  },
  {
    icon: TrendingUp,
    title: "Personalized recommendations",
    text: "Roles surfaced from your skills and experience.",
  },
];

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel */}
      <aside className="relative hidden overflow-hidden bg-slate-950 text-white lg:flex">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(60%_50%_at_20%_0%,rgba(99,102,241,0.35),transparent),radial-gradient(50%_40%_at_100%_100%,rgba(59,130,246,0.20),transparent)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:44px_44px]"
        />

        <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16">
          <Brand light />

          <div className="max-w-lg">
            <h2 className="text-4xl font-semibold leading-tight tracking-tight xl:text-5xl">
              Hiring and job search,{" "}
              <span className="text-indigo-400">matched by AI.</span>
            </h2>
            <p className="mt-5 text-base leading-relaxed text-slate-400">
              Connect candidates and recruiters faster with intelligent
              resume analysis and job matching.
            </p>

            <ul className="mt-10 space-y-5">
              {features.map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                    <Icon className="h-5 w-5 text-indigo-300" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{title}</p>
                    <p className="text-sm text-slate-400">{text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-slate-500">© 2026 TalentSync</p>
        </div>
      </aside>

      {/* Form panel */}
      <main className="flex flex-col items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
        <div className="w-full max-w-[26rem]">
          <div className="mb-8 lg:hidden">
            <Brand />
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}

export function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-sm font-medium text-slate-700"
    >
      {children}
    </label>
  );
}

export function FormError({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700"
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}

export function RoleSelector({
  value,
  onChange,
}: {
  value: Role;
  onChange: (role: Role) => void;
}) {
  const options: { value: Role; label: string }[] = [
    { value: "CANDIDATE", label: "Candidate" },
    { value: "RECRUITER", label: "Recruiter" },
  ];

  return (
    <div
      role="radiogroup"
      aria-label="Account type"
      className="grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1"
    >
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={`rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1 ${
              active
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

type PasswordFieldProps = {
  id: string;
  name?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  autoComplete: string;
  placeholder?: string;
};

export function PasswordField({
  id,
  name,
  value,
  onChange,
  autoComplete,
  placeholder,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        id={id}
        name={name}
        type={visible ? "text" : "password"}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        placeholder={placeholder}
        required
        className="h-11 pr-11"
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-md text-slate-400 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      >
        {visible ? (
          <EyeOff className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Eye className="h-4 w-4" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}