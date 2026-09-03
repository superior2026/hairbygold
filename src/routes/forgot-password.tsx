import { createFileRoute, Link } from "@tanstack/react-router";
import { MailCheck } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Reset Password — Hair by Gold" },
      {
        name: "description",
        content: "Request a password reset link for your Hair by Gold studio account.",
      },
      { property: "og:title", content: "Reset Password — Hair by Gold" },
      { property: "og:description", content: "Request a reset link (demo only)." },
    ],
  }),
  component: ForgotPassword,
});

const schema = z.object({ email: z.string().trim().email("Enter a valid email").max(255) });

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Enter a valid email");
      return;
    }
    setError(null);
    setSent(true);
  };

  return (
    <div className="mx-auto max-w-md px-5 py-16 lg:px-8">
      <div className="text-center">
        <BrandLogo className="mx-auto" imgClassName="h-10 sm:h-12" />
        <h1 className="mt-6 font-display text-4xl">Reset password</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We&apos;ll send a reset link — mock flow, no email is sent.
        </p>
      </div>

      {sent ? (
        <div
          role="status"
          className="mt-8 rounded-sm border border-success/40 bg-card p-7 text-center"
        >
          <MailCheck className="mx-auto size-7 text-success" aria-hidden="true" />
          <p className="mt-4 font-display text-2xl">Check your inbox</p>
          <p className="mt-2 text-sm text-muted-foreground">
            A reset link would be on its way to {email}.
          </p>
          <Button asChild variant="outline" className="mt-6">
            <Link to="/login">Back to sign in</Link>
          </Button>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-8 space-y-5 rounded-sm border border-border bg-card p-7">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              className="mt-2"
              maxLength={255}
              value={email}
              aria-invalid={!!error}
              onChange={(e) => setEmail(e.target.value)}
            />
            {error ? (
              <p role="alert" className="mt-1.5 text-xs text-destructive">
                {error}
              </p>
            ) : null}
          </div>
          <Button type="submit" className="w-full">
            Send reset link
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            <Link to="/login" className="hover:text-primary">
              Back to sign in
            </Link>
          </p>
        </form>
      )}
    </div>
  );
}
