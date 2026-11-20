"use client";

import { useEffect, useRef, useState } from "react";
import { CircleAlert, Info } from "lucide-react";
import { signIn } from "@/app/admin/actions";
import { Field, describedBy } from "@/components/admin/field";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DEMO_ADMIN } from "@/lib/demo-admin";
import {
  EMAIL_ERROR,
  PASSWORD_ERROR,
  isEmail,
} from "@/lib/admin-validation";

type Errors = { email?: string; password?: string };

export function LoginForm({ next }: { next: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [credentialsError, setCredentialsError] = useState(false);
  const [busy, setBusy] = useState(false);
  // Counts failed sign-ins. The effect below moves focus to the Alert once it
  // has mounted.
  const [failures, setFailures] = useState(0);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const alertRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (failures > 0) alertRef.current?.focus();
  }, [failures]);

  const checkEmail = (value: string) => (isEmail(value) ? undefined : EMAIL_ERROR);
  const checkPassword = (value: string) => (value ? undefined : PASSWORD_ERROR);

  function fillDemoLogin() {
    setEmail(DEMO_ADMIN.email);
    setPassword(DEMO_ADMIN.password);
    setErrors({});
    setCredentialsError(false);
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // The busy button ignores presses: a second submit does nothing.
    if (busy) return;

    const found: Errors = {
      email: checkEmail(email),
      password: checkPassword(password),
    };
    setCredentialsError(false);
    if (found.email || found.password) {
      setErrors(found);
      (found.email ? emailRef : passwordRef).current?.focus();
      return;
    }
    setErrors({});
    setBusy(true);
    try {
      // On success the action redirects and this call never returns here.
      const result = await signIn({ email, password, next });
      setBusy(false);
      if ("errors" in result) {
        setErrors(result.errors);
        (result.errors.email ? emailRef : passwordRef).current?.focus();
      } else {
        setCredentialsError(true);
        setFailures((n) => n + 1);
      }
    } catch {
      setBusy(false);
      setCredentialsError(true);
      setFailures((n) => n + 1);
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle as="h1">Admin login</CardTitle>
        <CardDescription>Sign in to manage the demo store.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Alert>
          <Info aria-hidden="true" />
          <AlertTitle>Demo login</AlertTitle>
          <AlertDescription>
            <p>Email: {DEMO_ADMIN.email}</p>
            <p>Password: {DEMO_ADMIN.password}</p>
          </AlertDescription>
        </Alert>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={fillDemoLogin}
        >
          Use demo login
        </Button>
        <form noValidate onSubmit={onSubmit} className="grid gap-4">
          <Field
            id="login-email"
            label="Email"
            error={errors.email}
          >
            <Input
              ref={emailRef}
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={describedBy("login-email", false, errors.email)}
              onChange={(event) => {
                setEmail(event.target.value);
                if (errors.email) {
                  setErrors((prev) => ({
                    ...prev,
                    email: checkEmail(event.target.value),
                  }));
                }
              }}
              onBlur={() =>
                setErrors((prev) => ({ ...prev, email: checkEmail(email) }))
              }
            />
          </Field>
          <Field
            id="login-password"
            label="Password"
            error={errors.password}
          >
            <Input
              ref={passwordRef}
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              aria-invalid={errors.password ? true : undefined}
              aria-describedby={describedBy(
                "login-password",
                false,
                errors.password,
              )}
              onChange={(event) => {
                setPassword(event.target.value);
                if (errors.password) {
                  setErrors((prev) => ({
                    ...prev,
                    password: checkPassword(event.target.value),
                  }));
                }
              }}
              onBlur={() =>
                setErrors((prev) => ({
                  ...prev,
                  password: checkPassword(password),
                }))
              }
            />
          </Field>
          {credentialsError ? (
            <Alert
              ref={alertRef}
              variant="destructive"
              role="alert"
              tabIndex={-1}
            >
              <CircleAlert aria-hidden="true" />
              <AlertDescription>Email or password is wrong.</AlertDescription>
            </Alert>
          ) : null}
          <Button
            type="submit"
            className="w-full"
            aria-disabled={busy ? "true" : undefined}
          >
            {busy ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
