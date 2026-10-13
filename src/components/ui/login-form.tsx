import type React from "react";
import { cn } from "../../lib/utils";

import { Button } from "../../components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "../../components/ui/field";
import { Input } from "../../components/ui/input";

interface LoginFormProps extends React.ComponentProps<"form"> {
  email: string;
  password: string;
  loading: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
}

export function LoginForm({
  className,
  email,
  password,
  loading,
  onEmailChange,
  onPasswordChange,
  ...props
}: LoginFormProps) {
  return (
    <form
      className={cn("w-full", className)}
      {...props}
    >
      <FieldGroup className="gap-5">

        {/* Heading */}
        <div className="mb-3 flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            Welcome back
          </h1>

          <p className="text-sm text-muted-foreground">
            Sign in to continue to your account
          </p>
        </div>

        {/* Email */}
        <Field>
          <FieldLabel
            htmlFor="email"
            className="text-sm font-medium"
          >
            Email
          </FieldLabel>

          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            className="h-11"
            required
          />
        </Field>

        {/* Password */}
        <Field>
          <div className="flex items-center justify-between">
            <FieldLabel
              htmlFor="password"
              className="text-sm font-medium"
            >
              Password
            </FieldLabel>

            <button
              type="button"
              className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Forgot password?
            </button>
          </div>

          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            className="h-11"
            required
          />
        </Field>

        {/* Submit */}
        <Button
          type="submit"
          className="h-11 w-full text-sm font-medium"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign In"}
        </Button>

        {/* Divider */}
        <FieldSeparator className="my-1">
          <span className="px-2 text-xs uppercase tracking-wider text-muted-foreground">
            Or continue with
          </span>
        </FieldSeparator>

        {/* Google */}
        <Button
          variant="outline"
          type="button"
          className="h-11 w-full gap-3 font-medium"
          disabled
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              fill="#4285F4"
              d="M21.35 12.23c0-.79-.07-1.55-.23-2.27H12v4.3h5.23a4.47 4.47 0 0 1-1.94 2.93v2.44h3.14c1.84-1.69 2.92-4.18 2.92-7.4Z"
            />
            <path
              fill="#34A853"
              d="M12 21.6c2.63 0 4.84-.87 6.45-2.36l-3.14-2.44c-.87.58-1.98.92-3.31.92-2.55 0-4.71-1.72-5.49-4.04H3.26v2.52A9.74 9.74 0 0 0 12 21.6Z"
            />
            <path
              fill="#FBBC05"
              d="M6.51 13.68A5.85 5.85 0 0 1 6.2 12c0-.58.1-1.15.31-1.68V7.8H3.26A9.75 9.75 0 0 0 2.2 12c0 1.57.38 3.06 1.06 4.2l3.25-2.52Z"
            />
            <path
              fill="#EA4335"
              d="M12 6.28c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.83 3.37 14.63 2.4 12 2.4a9.74 9.74 0 0 0-8.74 5.4l3.25 2.52C7.29 8 9.45 6.28 12 6.28Z"
            />
          </svg>

          Continue with Google
        </Button>

        {/* GitHub */}
        <Button
          variant="outline"
          type="button"
          className="h-11 w-full gap-3 font-medium"
          disabled
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2.17c-3.2.7-3.87-1.54-3.87-1.54-.53-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.25 3.33.95.1-.74.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.25.45-2.27 1.18-3.07-.12-.29-.51-1.46.11-3.03 0 0 .97-.31 3.17 1.17.92-.26 1.9-.39 2.88-.39s1.96.13 2.88.39c2.2-1.48 3.17-1.17 3.17-1.17.62 1.57.23 2.74.11 3.03.73.8 1.18 1.82 1.18 3.07 0 4.41-2.69 5.39-5.25 5.68.41.35.78 1.05.78 2.12v3.14c0 .31.21.68.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
          </svg>

          Continue with GitHub
        </Button>

        {/* Register */}
        <FieldDescription className="pt-2 text-center text-sm">
          Don't have an account?{" "}
          <a
            href="/register"
            className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
          >
            Create an account
          </a>
        </FieldDescription>

      </FieldGroup>
    </form>
  );
}