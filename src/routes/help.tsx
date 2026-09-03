import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "Help Center — Hair by Gold" },
      { name: "description", content: "FAQs on delivery, lace care and returns, plus a support form for the studio team." },
      { property: "og:title", content: "Help Center — Hair by Gold" },
      { property: "og:description", content: "Answers on delivery, care and returns — plus support tickets." },
    ],
  }),
  component: Help,
});

const faqs = [
  {
    q: "How long does delivery take?",
    a: "Standard delivery is 5–7 business days, express is 2–3, and studio overnight arrives the next business day within Lagos.",
  },
  {
    q: "How do I care for an HD lace unit?",
    a: "Wash every 8–10 wears with sulphate-free shampoo, air dry on a stand, and store in a silk bag. Avoid oil directly on the lace.",
  },
  {
    q: "Can I return a wig?",
    a: "Unworn units in original packaging can be returned within 30 days. Custom-coloured and cut units are final sale.",
  },
  {
    q: "Do you ship internationally?",
    a: "Yes — insured tracked shipping to 40+ countries. Duties are calculated at checkout where applicable.",
  },
  {
    q: "Can a stylist help me choose?",
    a: "Absolutely. Open the concierge chat and a stylist will match length, texture and cap size to your shape.",
  },
];

const schema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80),
  email: z.string().trim().email("Enter a valid email").max(255),
  subject: z.string().trim().min(3, "Add a short subject").max(120),
  message: z.string().trim().min(20, "Tell us a little more (20+ characters)").max(1000),
});

function Help() {
  const [values, setValues] = useState({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [ticket, setTicket] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) next[String(issue.path[0])] = issue.message;
      setErrors(next);
      return;
    }
    setErrors({});
    setTicket(`HBG-${Math.floor(1000 + Math.random() * 9000)}`);
    setValues({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="mx-auto max-w-5xl px-5 py-12 lg:px-8">
      <header>
        <p className="text-[0.62rem] tracking-luxe text-primary">Support</p>
        <h1 className="mt-4 font-display text-5xl">Help center</h1>
      </header>

      <div className="mt-12 grid gap-12 lg:grid-cols-2">
        <section aria-labelledby="faq">
          <h2 id="faq" className="font-display text-3xl">
            Frequently asked
          </h2>
          <Accordion type="single" collapsible className="mt-6">
            {faqs.map((f, i) => (
              <AccordionItem key={f.q} value={`item-${i}`}>
                <AccordionTrigger className="text-left text-sm">{f.q}</AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        <section aria-labelledby="contact">
          <h2 id="contact" className="font-display text-3xl">
            Contact the studio
          </h2>

          {ticket ? (
            <div
              role="status"
              className="mt-6 rounded-sm border border-success/40 bg-card p-7 text-center"
            >
              <CheckCircle2 className="mx-auto size-7 text-success" aria-hidden="true" />
              <p className="mt-4 font-display text-2xl">Ticket {ticket} created</p>
              <p className="mt-2 text-sm text-muted-foreground">
                A stylist replies within one business day. You'll also see updates in your
                notifications.
              </p>
              <Button variant="outline" className="mt-6" onClick={() => setTicket(null)}>
                Submit another request
              </Button>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-6 space-y-5 rounded-sm border border-border bg-card p-7">
              {(
                [
                  ["name", "Your name", "text"],
                  ["email", "Email", "email"],
                  ["subject", "Subject", "text"],
                ] as const
              ).map(([name, label, type]) => (
                <div key={name}>
                  <Label htmlFor={name}>{label}</Label>
                  <Input
                    id={name}
                    type={type}
                    className="mt-2"
                    value={values[name]}
                    maxLength={255}
                    aria-invalid={!!errors[name]}
                    aria-describedby={errors[name] ? `${name}-error` : undefined}
                    onChange={(e) => setValues((v) => ({ ...v, [name]: e.target.value }))}
                  />
                  {errors[name] ? (
                    <p id={`${name}-error`} role="alert" className="mt-1.5 text-xs text-destructive">
                      {errors[name]}
                    </p>
                  ) : null}
                </div>
              ))}
              <div>
                <Label htmlFor="message">How can we help?</Label>
                <Textarea
                  id="message"
                  rows={5}
                  className="mt-2"
                  maxLength={1000}
                  value={values.message}
                  aria-invalid={!!errors["message"]}
                  aria-describedby={errors["message"] ? "message-error" : undefined}
                  onChange={(e) => setValues((v) => ({ ...v, message: e.target.value }))}
                />
                {errors["message"] ? (
                  <p id="message-error" role="alert" className="mt-1.5 text-xs text-destructive">
                    {errors["message"]}
                  </p>
                ) : null}
              </div>
              <Button type="submit" className="w-full">
                Submit request
              </Button>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
