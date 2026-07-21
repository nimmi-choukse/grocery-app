"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  isUserRole,
  ROLE_HOME_PATHS,
  roleFromSearchParam,
  type UserRole,
} from "@/types/auth";

type AuthMode = "login" | "signup";

const ROLE_LABELS: Record<UserRole, string> = {
  customer: "Customer",
  owner: "Store owner",
  delivery: "Delivery",
};

async function fetchProfileRole(
  supabase: ReturnType<typeof createClient>,
  userId: string,
): Promise<UserRole | null> {
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  return isUserRole(data?.role) ? data.role : null;
}

export default function AuthPage() {
  const router = useRouter();

  const [activeRole, setActiveRole] = useState<UserRole>("customer");
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();
  const canSignUp = activeRole === "customer";

  useEffect(() => {
    const role = new URLSearchParams(window.location.search).get("role");
    setActiveRole(roleFromSearchParam(role));
  }, []);

  useEffect(() => {
    if (!canSignUp && authMode === "signup") {
      setAuthMode("login");
    }
  }, [canSignUp, authMode]);

  function switchRole(role: UserRole) {
    setActiveRole(role);
    setAuthMode("login");
    setError(null);
    setMessage(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (authMode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role: "customer",
            },
          },
        });

        if (signUpError) {
          setError(signUpError.message);
          return;
        }

        if (data.session) {
          router.push(ROLE_HOME_PATHS.customer);
          router.refresh();
          return;
        }

        setMessage(
          "Account created successfully. Check your email to confirm, then sign in."
        );
        setAuthMode("login");
        return;
      }

      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      if (!data.user) {
        setError("Sign in failed. Please try again.");
        return;
      }

      const profileRole = await fetchProfileRole(supabase, data.user.id);

      if (!profileRole) {
        await supabase.auth.signOut();
        setError("No profile found for this account.");
        return;
      }

      if (profileRole !== activeRole) {
        await supabase.auth.signOut();
        setError(
          `This account belongs to ${ROLE_LABELS[profileRole]}, not ${ROLE_LABELS[activeRole]}.`
        );
        return;
      }

      router.push(ROLE_HOME_PATHS[profileRole]);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md border rounded-xl p-6 shadow-sm bg-background">
        <h1 className="text-2xl font-bold mb-1">Authentication</h1>
        <p className="text-sm text-foreground/70 mb-6">
          {canSignUp
            ? "Customers can create an account or sign in."
            : `${ROLE_LABELS[activeRole]} accounts are login only.`}
        </p>

        <div className="grid grid-cols-3 gap-2 mb-6">
          {(["customer", "owner", "delivery"] as const).map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => switchRole(role)}
              className={`rounded-lg border px-2 py-2 text-sm font-medium transition-colors ${
                activeRole === role
                  ? "border-foreground bg-foreground text-background"
                  : "border-foreground/20 hover:border-foreground/40"
              }`}
            >
              {ROLE_LABELS[role]}
            </button>
          ))}
        </div>

        {canSignUp && (
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => setAuthMode("login")}
              className={`flex-1 rounded-lg border py-2 text-sm font-medium ${
                authMode === "login"
                  ? "border-foreground bg-foreground/5"
                  : "border-foreground/20"
              }`}
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => setAuthMode("signup")}
              className={`flex-1 rounded-lg border py-2 text-sm font-medium ${
                authMode === "signup"
                  ? "border-foreground bg-foreground/5"
                  : "border-foreground/20"
              }`}
            >
              Sign up
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {authMode === "signup" && (
            <label className="block">
              <span className="text-sm font-medium">Full Name</span>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-foreground/20 bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground"
              />
            </label>
          )}

          <label className="block">
            <span className="text-sm font-medium">Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-foreground/20 bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Password</span>
            <input
              type="password"
              required
              minLength={6}
              autoComplete={
                authMode === "signup" ? "new-password" : "current-password"
              }
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-foreground/20 bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground"
            />
          </label>

          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          {message && (
            <p className="text-sm text-blue-700">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-foreground text-background py-2.5 text-sm font-semibold disabled:opacity-60"
          >
            {loading
              ? "Please wait..."
              : authMode === "signup"
              ? "Create Account"
              : "Log In"}
          </button>
        </form>
      </div>
    </main>
  );
}
