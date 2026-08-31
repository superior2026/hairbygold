import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CreditCard, Lock, Truck } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { paymentMethods } from "@/lib/mock-data";
import { currency, useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Hair by Gold" },
      {
        name: "description",
        content: "Confirm delivery details, pick a shipping speed and choose a payment method.",
      },
      { property: "og:title", content: "Checkout — Hair by Gold" },
      { property: "og:description", content: "Delivery, shipping speed and payment in one step." },
    ],
  }),
  component: Checkout,
});

const shippingOptions = [
  { id: "standard", label: "Standard", eta: "5–7 business days", cost: 18 },
  { id: "express", label: "Express", eta: "2–3 business days", cost: 34 },
  { id: "overnight", label: "Studio overnight", eta: "Next business day", cost: 62 },
];

const schema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(80),
  email: z.string().trim().email("Enter a valid email").max(255),
  address: z.string().trim().min(5, "Enter your street address").max(160),
  city: z.string().trim().min(2, "Enter your city").max(80),
  postcode: z.string().trim().min(3, "Enter a postal code").max(16),
});

function Checkout() {
  const navigate = useNavigate();
  const { subtotal, cartCount } = useStore();
  const [values, setValues] = useState({
    fullName: "Olamide Adebayo",
    email: "olamide@example.com",
    address: "18 Aderibigbe Close",
    city: "Lekki Phase 1, Lagos",
    postcode: "106104",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [shipping, setShipping] = useState("express");
  const [payment, setPayment] = useState(paymentMethods[0]!.id);

  const ship = shippingOptions.find((s) => s.id === shipping)!;
  const total = subtotal + ship.cost;

  const field = (name: keyof typeof values, label: string, extra?: { type?: string }) => (
    <div>
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        type={extra?.type ?? "text"}
        className="mt-2"
        value={values[name]}
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
  );

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
    navigate({ to: "/order-confirmation", search: { shipping: ship.id } });
  };

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
      <header>
        <p className="text-[0.62rem] tracking-luxe text-primary">Step 2 of 3</p>
        <h1 className="mt-4 font-display text-5xl">Checkout</h1>
      </header>

      <form onSubmit={submit} className="mt-12 grid gap-12 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-12">
          <fieldset>
            <legend className="font-display text-2xl">Delivery details</legend>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              {field("fullName", "Full name")}
              {field("email", "Email", { type: "email" })}
              <div className="sm:col-span-2">{field("address", "Street address")}</div>
              {field("city", "City")}
              {field("postcode", "Postal code")}
            </div>
          </fieldset>

          <fieldset>
            <legend className="font-display text-2xl">Shipping speed</legend>
            <RadioGroup value={shipping} onValueChange={setShipping} className="mt-6 space-y-3">
              {shippingOptions.map((o) => (
                <Label
                  key={o.id}
                  htmlFor={`ship-${o.id}`}
                  className={cn(
                    "flex cursor-pointer items-center gap-4 rounded-sm border p-5 transition",
                    shipping === o.id ? "border-primary bg-secondary" : "border-input hover:bg-secondary",
                  )}
                >
                  <RadioGroupItem value={o.id} id={`ship-${o.id}`} />
                  <Truck className="size-4 text-primary" aria-hidden="true" />
                  <span className="flex-1">
                    <span className="block text-sm font-medium">{o.label}</span>
                    <span className="block text-xs text-muted-foreground">{o.eta}</span>
                  </span>
                  <span className="text-sm">{currency(o.cost)}</span>
                </Label>
              ))}
            </RadioGroup>
          </fieldset>

          <fieldset>
            <legend className="font-display text-2xl">Payment method</legend>
            <RadioGroup value={payment} onValueChange={setPayment} className="mt-6 space-y-3">
              {paymentMethods.map((m) => (
                <Label
                  key={m.id}
                  htmlFor={`pay-${m.id}`}
                  className={cn(
                    "flex cursor-pointer items-center gap-4 rounded-sm border p-5 transition",
                    payment === m.id ? "border-primary bg-secondary" : "border-input hover:bg-secondary",
                  )}
                >
                  <RadioGroupItem value={m.id} id={`pay-${m.id}`} />
                  <CreditCard className="size-4 text-primary" aria-hidden="true" />
                  <span className="flex-1">
                    <span className="block text-sm font-medium">
                      {m.brand} •••• {m.last4}
                    </span>
                    <span className="block text-xs text-muted-foreground">Expires {m.expiry}</span>
                  </span>
                </Label>
              ))}
            </RadioGroup>
            <p className="mt-4 text-xs text-muted-foreground">
              Need another card?{" "}
              <Link to="/payment" className="text-primary hover:underline">
                Manage payment methods
              </Link>
            </p>
          </fieldset>
        </div>

        <aside aria-label="Order summary" className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-sm border border-border bg-card p-7">
            <h2 className="font-display text-2xl">Summary</h2>
            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Items ({cartCount})</dt>
                <dd>{currency(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">{ship.label} shipping</dt>
                <dd>{currency(ship.cost)}</dd>
              </div>
              <div className="flex justify-between border-t border-border pt-4">
                <dt className="font-display text-xl">Total</dt>
                <dd className="font-display text-xl">{currency(total)}</dd>
              </div>
            </dl>
            <Button type="submit" size="lg" className="mt-7 w-full">
              <Lock className="size-4" aria-hidden="true" />
              Place order
            </Button>
            <p className="mt-3 text-center text-[0.65rem] text-muted-foreground">
              Mock checkout — no card is charged.
            </p>
          </div>
        </aside>
      </form>
    </div>
  );
}
