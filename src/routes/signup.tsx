import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create Account — Hair by Gold" },
      {
        name: "description",
        content: "Create a Hair by Gold account to chat with the studio and book appointments.",
      },
      { property: "og:title", content: "Create Account — Hair by Gold" },
      { property: "og:description", content: "Create your Hair by Gold account." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Signup,
});

const schema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80),
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(8, "Use at least 8 characters").max(72),
});

function Signup() {
  const navigate = useNavigate();
  const [values, setValues] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const i of parsed.error.issues) next[String(i.path[0])] = i.message;
      setErrors(next);
      return;
    }
    setErrors({});
    setMessage("");
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: { emailRedirectTo: `${window.location.origin}/login`, data: { full_name: parsed.data.name } },
    });
    setBusy(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    if (data.session) {
      void navigate({ to: "/account", replace: true });
      return;
    }
    setConfirm(true);
  };

  return (
    <div className="mx-auto max-w-md px-5 py-16 lg:px-8">
      <div className="text-center">
        <BrandLogo className="mx-auto" imgClassName="h-10 sm:h-12" />
        <h1 className="mt-6 font-display text-4xl">Create your account</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your chats, bookings and profile are saved to your account.
        </p>
      </div>

      {confirm ? (
        <p
          role="status"
          className="mt-8 rounded-sm border border-primary/40 bg-card p-6 text-center text-sm"
        >
          Check your email and click the confirmation link, then{" "}
          <Link to="/login" className="text-primary underline">
            sign in
          </Link>
          .
        </p>
      ) : (
        <form onSubmit={submit} noValidate className="mt-8 space-y-5 rounded-sm border border-border bg-card p-7">
          <div>
            <Label htmlFor="su-email">Email</Label>
            <Input
              id="su-email"
              type="email"
              autoComplete="email"
              className="mt-2"
              maxLength={255}
              value={values.email}
              aria-invalid={!!errors["email"]}
              onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
            />
            {errors["email"] ? (
              <p role="alert" className="mt-1.5 text-xs text-destructive">
                {errors["email"]}
              </p>
            ) : null}
          </div>
          <div>
            <Label htmlFor="su-password">Password</Label>
            <Input
              id="su-password"
              type="password"
              autoComplete="new-password"
              className="mt-2"
              maxLength={72}
              value={values.password}
              aria-invalid={!!errors["password"]}
              onChange={(e) => setValues((v) => ({ ...v, password: e.target.value }))}
            />
            {errors["password"] ? (
              <p role="alert" className="mt-1.5 text-xs text-destructive">
                {errors["password"]}
              </p>
            ) : null}
          </div>
          {message ? (
            <p role="alert" className="text-sm text-destructive">
              {message}
            </p>
          ) : null}
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Creating…" : "Create account"}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="hover:text-primary">
              Sign in
            </Link>
          </p>
        </form>
      )}
    </div>
  );
}
