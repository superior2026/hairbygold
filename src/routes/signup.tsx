import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create Account — Hair by Gold" },
      {
        name: "description",
        content: "Create a Hair by Gold account for saved wishlists, order tracking and stylist concierge.",
      },
      { property: "og:title", content: "Create Account — Hair by Gold" },
      { property: "og:description", content: "Join the Hair by Gold studio list." },
    ],
  }),
  component: Signup,
});

const schema = z
  .object({
    name: z.string().trim().min(2, "Enter your full name").max(80),
    email: z.string().trim().email("Enter a valid email").max(255),
    password: z.string().min(8, "At least 8 characters").max(72),
    confirm: z.string().max(72),
  })
  .refine((v) => v.password === v.confirm, {
    path: ["confirm"],
    message: "Passwords do not match",
  });

const fields = [
  ["name", "Full name", "text"],
  ["email", "Email", "email"],
  ["password", "Password", "password"],
  ["confirm", "Confirm password", "password"],
] as const;

function Signup() {
  const [values, setValues] = useState({ name: "", email: "", password: "", confirm: "" });
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
        <h1 className="mt-6 font-display text-4xl">Create your account</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Demo scaffold — nothing is stored and no account is created.
        </p>
      </div>

      {done ? (
        <p
          role="status"
          className="mt-8 rounded-sm border border-success/40 bg-card p-6 text-center text-sm"
        >
          Account created (mock). You can{" "}
          <Link to="/login" className="text-primary underline">
            sign in
          </Link>{" "}
          now.
        </p>
      ) : (
        <form onSubmit={submit} className="mt-8 space-y-5 rounded-sm border border-border bg-card p-7">
          {fields.map(([name, label, type]) => (
            <div key={name}>
              <Label htmlFor={name}>{label}</Label>
              <Input
                id={name}
                type={type}
                className="mt-2"
                maxLength={255}
                value={values[name]}
                aria-invalid={!!errors[name]}
                onChange={(e) => setValues((v) => ({ ...v, [name]: e.target.value }))}
              />
              {errors[name] ? (
                <p role="alert" className="mt-1.5 text-xs text-destructive">
                  {errors[name]}
                </p>
              ) : null}
            </div>
          ))}
          <Button type="submit" className="w-full">
            Create account
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
