import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign In — Hair by Gold" },
      {
        name: "description",
        content: "Sign in to the Hair by Gold studio account to manage products, messages and bookings.",
      },
      { property: "og:title", content: "Sign In — Hair by Gold" },
      { property: "og:description", content: "Sign in to your Hair by Gold account." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Login,
});

const schema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(8, "At least 8 characters").max(72),
});

function Login() {
  const navigate = useNavigate();
  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [unverified, setUnverified] = useState(false);
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
    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });
    setBusy(false);
    if (error) {
      if (error.message.toLowerCase().includes("not confirmed")) {
        setUnverified(true);
        setMessage("Your email isn't verified yet. Enter the code we sent you to activate your account.");
        return;
      }
      setMessage(error.message);
      return;
    }
    void navigate({ to: "/account", replace: true });
  };

  return (
    <div className="mx-auto max-w-md px-5 py-16 lg:px-8">
      <div className="text-center">
        <BrandLogo className="mx-auto" imgClassName="h-10 sm:h-12" />
        <h1 className="mt-6 font-display text-4xl">Sign in</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to chat with the studio, book appointments and see your history.
        </p>
      </div>

      <form onSubmit={submit} noValidate className="mt-8 space-y-5 rounded-sm border border-border bg-card p-7">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
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
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
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
        {unverified ? (
          <Link
            to="/verify-email"
            search={{ email: values.email }}
            className="block text-center text-sm text-primary underline"
          >
            Enter my verification code
          </Link>
        ) : null}
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </Button>
        <div className="flex justify-between text-xs text-muted-foreground">
          <Link to="/forgot-password" className="hover:text-primary">
            Forgot password?
          </Link>
          <Link to="/signup" className="hover:text-primary">
            Create studio account
          </Link>
        </div>
      </form>
    </div>
  );
}
