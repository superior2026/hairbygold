import { createFileRoute } from "@tanstack/react-router";
import { CreditCard, Plus, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { RowsSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFakeLoading } from "@/hooks/use-fake-loading";
import { orders, paymentMethods } from "@/lib/mock-data";
import { currency } from "@/lib/store";

export const Route = createFileRoute("/payment")({
  head: () => ({
    meta: [
      { title: "Payment Methods — Hair by Gold" },
      { name: "description", content: "Manage saved cards and review your Hair by Gold payment history." },
      { property: "og:title", content: "Payment Methods — Hair by Gold" },
      { property: "og:description", content: "Saved cards and payment history (mock data)." },
    ],
  }),
  component: Payment,
});

function Payment() {
  const loading = useFakeLoading(800);
  const [cards, setCards] = useState(paymentMethods);
  const [form, setForm] = useState({ number: "", name: "", expiry: "", cvc: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (form["number"].replace(/\s/g, "").length < 15) next["number"] = "Enter a 16-digit card number";
    if (form["name"].trim().length < 2) next["name"] = "Enter the name on the card";
    if (!/^\d{2}\/\d{2}$/.test(form["expiry"])) next["expiry"] = "Use MM/YY";
    if (form["cvc"].length < 3) next["cvc"] = "3 digits";
    setErrors(next);
    if (Object.keys(next).length) return;
    setCards((prev) => [
      ...prev,
      {
        id: `pm${prev.length + 1}`,
        brand: "Visa",
        last4: form["number"].replace(/\s/g, "").slice(-4),
        expiry: form["expiry"],
        primary: false,
      },
    ]);
    setForm({ number: "", name: "", expiry: "", cvc: "" });
    toast.success("Card saved (mock)");
  };

  const field = (
    name: keyof typeof form,
    label: string,
    props: { placeholder?: string; maxLength?: number } = {},
  ) => (
    <div>
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        className="mt-2"
        value={form[name]}
        placeholder={props.placeholder}
        maxLength={props.maxLength ?? 40}
        aria-invalid={!!errors[name]}
        aria-describedby={errors[name] ? `${name}-error` : undefined}
        onChange={(e) => setForm((f) => ({ ...f, [name]: e.target.value }))}
      />
      {errors[name] ? (
        <p id={`${name}-error`} role="alert" className="mt-1.5 text-xs text-destructive">
          {errors[name]}
        </p>
      ) : null}
    </div>
  );

  return (
    <div className="mx-auto max-w-5xl px-5 py-12 lg:px-8">
      <header>
        <p className="text-[0.62rem] tracking-luxe text-primary">Billing</p>
        <h1 className="mt-4 font-display text-5xl">Payment methods</h1>
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <section aria-labelledby="cards">
          <h2 id="cards" className="font-display text-2xl">
            Saved cards
          </h2>
          <ul className="mt-5 space-y-3">
            {cards.map((c) => (
              <li key={c.id} className="flex items-center gap-4 rounded-sm border border-border bg-card p-5">
                <CreditCard className="size-4 text-primary" aria-hidden="true" />
                <div className="flex-1">
                  <p className="text-sm">
                    {c.brand} •••• {c.last4}
                  </p>
                  <p className="text-xs text-muted-foreground">Expires {c.expiry}</p>
                </div>
                {c.primary ? (
                  <span className="rounded-sm bg-secondary px-2 py-1 text-[0.6rem] tracking-luxe text-primary">
                    Default
                  </span>
                ) : null}
              </li>
            ))}
          </ul>

          <form onSubmit={submit} className="mt-8 rounded-sm border border-border bg-card p-6">
            <h3 className="font-display text-xl">Add a card</h3>
            <div className="mt-5 space-y-5">
              {field("number", "Card number", { placeholder: "4242 4242 4242 4242", maxLength: 19 })}
              {field("name", "Name on card", { placeholder: "Olamide Adebayo" })}
              <div className="grid grid-cols-2 gap-4">
                {field("expiry", "Expiry", { placeholder: "07/29", maxLength: 5 })}
                {field("cvc", "CVC", { placeholder: "123", maxLength: 4 })}
              </div>
            </div>
            <Button type="submit" className="mt-6 w-full">
              <Plus className="size-4" aria-hidden="true" />
              Save card
            </Button>
            <p className="mt-3 inline-flex items-center gap-1.5 text-[0.65rem] text-muted-foreground">
              <ShieldCheck className="size-3.5" aria-hidden="true" />
              Demo only — nothing is stored or charged.
            </p>
          </form>
        </section>

        <section aria-labelledby="history" aria-busy={loading}>
          <h2 id="history" className="font-display text-2xl">
            Payment history
          </h2>
          <div className="mt-5">
            {loading ? (
              <RowsSkeleton rows={4} />
            ) : (
              <ul className="divide-y divide-border border-y border-border">
                {orders.map((o) => (
                  <li key={o.id} className="flex items-center justify-between gap-4 py-5">
                    <div>
                      <p className="text-sm">#{o.id}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {o.date} · {o.method}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">{currency(o.total)}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{o.status}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
