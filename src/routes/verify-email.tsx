import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

const searchSchema = z.object({
  email: z.string().trim().email().catch(""),
});

export const Route = createFileRoute("/verify-email")({
  validateSearch: (search: Record<string, unknown>) => searchSchema.parse(search),
  head: () => ({
    meta: [
      { title: "Verify Your Email — Hair by Gold" },
      {
        name: "description",
        content: "Enter the verification code we emailed you to activate your Hair by Gold account.",
      },
      { property: "og:title", content: "Verify Your Email — Hair by Gold" },
      { property: "og:description", content: "Confirm your email to use your Hair by Gold account." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: VerifyEmail,
});

function VerifyEmail() {
  const navigate = useNavigate();
  const { email: initialEmail } = Route.useSearch();
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [resent, setResent] = useState(false);
  const [busy, setBusy] = useState(false);

  // If the customer clicked the confirmation link instead, the session is
  // already verified — send them straight to their account.
  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email_confirmed_at) {
        void navigate({ to: "/account", replace: true });
      }
    });
  }, [navigate]);

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    if (!email.includes("@")) {
      setMessage("Enter the email address you signed up with.");
      return;
    }
    if (!/^\d{6,8}$/.test(code.trim())) {
      setMessage("Enter the verification code from your email.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: code.trim(),
      type: "signup",
    });
    setBusy(false);
    if (error) {
      setMessage(
        error.message.toLowerCase().includes("expired") || error.message.toLowerCase().includes("invalid")
          ? "That code didn't work. Check the code and try again, or resend a new one."
          : error.message,
      );
      return;
    }
    void navigate({ to: "/account", replace: true });
  };

  const resend = async () => {
    setMessage("");
    setResent(false);
    if (!email.includes("@")) {
      setMessage("Enter the email address you signed up with first.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.resend({ type: "signup", email: email.trim() });
    setBusy(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    setResent(true);
  };

  return (
    <div className="mx-auto max-w-md px-5 py-16 lg:px-8">
      <div className="text-center">
        <BrandLogo className="mx-auto" imgClassName="h-10 sm:h-12" />
        <h1 className="mt-6 font-display text-4xl">Check your email</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We sent a verification code{initialEmail ? ` to ${initialEmail}` : " to your email address"}. Enter it
          below to activate your account — your account pages stay locked until then.
        </p>
      </div>

      <form onSubmit={verify} noValidate className="mt-8 space-y-5 rounded-sm border border-border bg-card p-7">
        <div>
          <Label htmlFor="ve-email">Email</Label>
          <Input
            id="ve-email"
            type="email"
            autoComplete="email"
            className="mt-2"
            maxLength={255}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="ve-code">Verification code</Label>
          <Input
            id="ve-code"
            inputMode="numeric"
            autoComplete="one-time-code"
            className="mt-2 tracking-[0.4em]"
            maxLength={8}
            placeholder="••••••"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/[^\d]/g, ""))}
          />
        </div>
        {message ? (
          <p role="alert" className="text-sm text-destructive">
            {message}
          </p>
        ) : null}
        {resent ? (
          <p role="status" className="text-sm text-primary">
            A new code is on its way — check your inbox and spam folder.
          </p>
        ) : null}
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? "Verifying…" : "Verify my email"}
        </Button>
        <div className="flex justify-between text-xs text-muted-foreground">
          <button type="button" onClick={resend} disabled={busy} className="hover:text-primary">
            Resend code
          </button>
          <Link to="/login" className="hover:text-primary">
            Back to sign in
          </Link>
        </div>
      </form>
    </div>
  );
}
