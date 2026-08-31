"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "react-bootstrap";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { getMe, loginUser } from "@/services/auth/auth.service";
import { useSessionStore } from "@/store/useSessionStore";
import { useNotificationContext } from "@/context/useNotificationContext";
import { applyServerErrors } from "@/utils/applyServerErrors";
import { loginFormSchema, LoginFormValues } from "@/types/schemas/login.schema";
import type { NormalizedError } from "@/types/error.type";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/";
  const setSession = useSessionStore((s) => s.setSession);
  const { showNotification } = useNotificationContext();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: "", password: "" },
  });

  async function handleSubmit(values: LoginFormValues) {
    setLoading(true);
    try {
      const res = await loginUser(values.email, values.password);

      // The login response's `user` field isn't confirmed by the backend's
      // API docs (see the comment in auth.service.ts) — fetch it
      // explicitly via /api/auth/me/ if it wasn't included, so the topbar
      // and profile page always have real data rather than a guess.
      let user = res.user;
      if (!user) {
        useSessionStore.getState().setSession({
          accessToken: res.access,
          refreshToken: res.refresh,
          user: {} as never,
        });
        user = await getMe();
      }

      setSession({ accessToken: res.access, refreshToken: res.refresh, user });
      router.push(nextPath);
      router.refresh();
    } catch (err) {
      const normalized = err as NormalizedError;
      showNotification({
        message: normalized?.message || "Sign in failed",
        variant: "danger",
      });
      applyServerErrors(normalized, form.setError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body p-4 p-md-5">
        <h3 className="fw-bold mb-1">Welcome back</h3>
        <p className="text-muted small mb-4">
          Sign in to your Drum Tracer account
        </p>

        <Form onSubmit={form.handleSubmit(handleSubmit)} noValidate>
          <Form.Group className="mb-3">
            <Form.Label className="small fw-semibold">Email</Form.Label>
            <div className="input-group has-validation">
              <span className="input-group-text bg-white">
                <IconifyIcon icon="ri:mail-line" />
              </span>
              <Form.Control
                type="email"
                placeholder="you@company.com"
                autoFocus
                isInvalid={!!form.formState.errors.email}
                {...form.register("email")}
              />
              <Form.Control.Feedback type="invalid">
                {form.formState.errors.email?.message}
              </Form.Control.Feedback>
            </div>
          </Form.Group>

          <Form.Group className="mb-2">
            <div className="d-flex justify-content-between">
              <Form.Label className="small fw-semibold">Password</Form.Label>
              <Link
                href="/forgot-password"
                className="small fw-semibold text-decoration-none"
              >
                Forgot password?
              </Link>
            </div>
            <div className="input-group has-validation">
              <span className="input-group-text bg-white">
                <IconifyIcon icon="ri:lock-line" />
              </span>
              <Form.Control
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                isInvalid={!!form.formState.errors.password}
                {...form.register("password")}
              />
              <button
                type="button"
                className="input-group-text bg-white"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <IconifyIcon
                  icon={showPassword ? "ri:eye-off-line" : "ri:eye-line"}
                />
              </button>
              <Form.Control.Feedback type="invalid">
                {form.formState.errors.password?.message}
              </Form.Control.Feedback>
            </div>
          </Form.Group>

          <button
            type="submit"
            className="btn btn-primary w-100 mt-4 py-2 fw-semibold"
            disabled={loading}
          >
            {loading ? (
              <span className="d-inline-flex align-items-center gap-2">
                <span className="spinner-border spinner-border-sm" /> Signing
                in...
              </span>
            ) : (
              "Sign in"
            )}
          </button>
        </Form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
