import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign In — Hair by Gold" },
      {
        name: "description",
        content: "Sign in to your Hair by Gold account to track orders, wishlists and concierge chats.",
      },
      { property: "og:title", content: "Sign In — Hair by Gold" },
      { property: "og:description", content: "Access your Hair by Gold studio account." },
    ],
  }),
  component: Login,
});

const schema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(8, "At least 8 characters").max(72),
});

function Login() {
  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const i of parsed.error.issues) next[String(i.path[0])] = i.message;
      setErrors(next);
      return;
    }
    setErrors({});
    setDone(true);
  };

  return (
    <div className="mx-auto max-w-md px-5 py-16 lg:px-8">
      <div className="text-center">
        <BrandLogo className="mx-auto" />
        <h1 className="mt-6 font-display text-4xl">Welcome back</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Demo scaffold — no real authentication is performed.
        </p>
      </div>

      {done ? (
        <p
          role="status"
          className="mt-8 rounded-sm border border-success/40 bg-card p-6 text-center text-sm"
        >
          Signed in (mock). Continue to{" "}
          <Link to="/explore" className="text-primary underline">
            Explore
          </Link>
          .
        </p>
      ) : (
        <form onSubmit={submit} className="mt-8 space-y-5 rounded-sm border border-border bg-card p-7">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              className="mt-2"
              maxLength={255}
              value={values["email"]}
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
              className="mt-2"
              maxLength={72}
              value={values["password"]}
              aria-invalid={!!errors["password"]}
              onChange={(e) => setValues((v) => ({ ...v, password: e.target.value }))}
            />
            {errors["password"] ? (
              <p role="alert" className="mt-1.5 text-xs text-destructive">
                {errors["password"]}
              </p>
            ) : null}
          </div>
          <Button type="submit" className="w-full">
            Sign in
          </Button>
          <div className="flex justify-between text-xs text-muted-foreground">
            <Link to="/forgot-password" className="hover:text-primary">
              Forgot password?
            </Link>
            <Link to="/signup" className="hover:text-primary">
              Create account
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
