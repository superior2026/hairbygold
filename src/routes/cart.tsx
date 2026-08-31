import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Tag, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useFakeLoading } from "@/hooks/use-fake-loading";
import { promoCodes } from "@/lib/mock-data";
import { currency, useStore } from "@/lib/store";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Bag — Hair by Gold" },
      {
        name: "description",
        content: "Review your Hair by Gold bag, adjust quantities, apply a promo code and check out.",
      },
      { property: "og:title", content: "Your Bag — Hair by Gold" },
      { property: "og:description", content: "Review your bag and continue to secure checkout." },
    ],
  }),
  component: Cart,
});

export function useCartTotals(discountRate: number, shipping = 18) {
  const { subtotal } = useStore();
  const discount = subtotal * discountRate;
  const total = Math.max(0, subtotal - discount) + (subtotal > 0 ? shipping : 0);
  return { subtotal, discount, shipping: subtotal > 0 ? shipping : 0, total };
}

function Cart() {
  const { cart, setQty, removeLine } = useStore();
  const loading = useFakeLoading(700);
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState<{ code: string; rate: number } | null>(null);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);

  const totals = useCartTotals(applied?.rate ?? 0);

  const applyCode = (e: React.FormEvent) => {
    e.preventDefault();
    const value = code.trim().toUpperCase();
    setError("");
    if (!value) {
      setError("Enter a promo code to continue.");
      return;
    }
    setChecking(true);
    setTimeout(() => {
      setChecking(false);
      const rate = promoCodes[value];
      if (rate) {
        setApplied({ code: value, rate });
        toast.success(`${value} applied — ${Math.round(rate * 100)}% off`);
      } else {
        setApplied(null);
        setError("That code isn't valid or has expired.");
      }
    }, 800);
  };

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
      <header>
        <p className="text-[0.62rem] tracking-luxe text-primary">Step 1 of 3</p>
        <h1 className="mt-4 font-display text-5xl">Your bag</h1>
      </header>

      {loading ? (
        <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_22rem]">
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-5">
                <Skeleton className="size-28 rounded-sm" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-9 w-32" />
                </div>
              </div>
            ))}
          </div>
          <Skeleton className="h-72 rounded-sm" />
        </div>
      ) : cart.length === 0 ? (
        <div className="mt-12 rounded-sm border border-dashed border-border p-16 text-center">
          <ShoppingBag className="mx-auto size-6 text-primary" aria-hidden="true" />
          <h2 className="mt-5 font-display text-3xl">Your bag is empty</h2>
          <Button asChild className="mt-7">
            <Link to="/explore">Start shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_22rem]">
          <section aria-label="Bag items">
            <ul className="divide-y divide-border border-y border-border">
              {cart.map((line) => (
                <li key={line.product.id} className="flex gap-5 py-6">
                  <Link
                    to="/product/$productId"
                    params={{ productId: line.product.id }}
                    className="shrink-0"
                  >
                    <img
                      src={line.product.image}
                      alt={line.product.name}
                      loading="lazy"
                      width={1024}
                      height={1024}
                      className="size-28 rounded-sm object-cover"
                    />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <Link
                          to="/product/$productId"
                          params={{ productId: line.product.id }}
                          className="font-display text-xl hover:text-primary"
                        >
                          {line.product.name}
                        </Link>
                        <p className="mt-1 text-xs text-muted-foreground">{line.size}</p>
                      </div>
                      <span className="text-sm">{currency(line.product.price * line.qty)}</span>
                    </div>

                    <div className="mt-auto flex items-center gap-4 pt-4">
                      <div className="flex items-center rounded-sm border border-input">
                        <button
                          type="button"
                          aria-label={`Decrease quantity of ${line.product.name}`}
                          onClick={() => setQty(line.product.id, line.qty - 1)}
                          className="grid size-10 place-items-center text-muted-foreground transition hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
                        >
                          <Minus className="size-4" aria-hidden="true" />
                        </button>
                        <span className="w-9 text-center text-sm">{line.qty}</span>
                        <button
                          type="button"
                          aria-label={`Increase quantity of ${line.product.name}`}
                          onClick={() => setQty(line.product.id, line.qty + 1)}
                          className="grid size-10 place-items-center text-muted-foreground transition hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
                        >
                          <Plus className="size-4" aria-hidden="true" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          removeLine(line.product.id);
                          toast.success("Removed from bag");
                        }}
                        className="inline-flex items-center gap-1.5 rounded-sm text-xs text-muted-foreground transition hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring/50"
                      >
                        <Trash2 className="size-3.5" aria-hidden="true" />
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <aside aria-label="Order summary" className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-sm border border-border bg-card p-7">
              <h2 className="font-display text-2xl">Order summary</h2>

              <form onSubmit={applyCode} className="mt-6">
                <Label htmlFor="promo" className="text-xs text-muted-foreground">
                  Promo code
                </Label>
                <div className="mt-2 flex gap-2">
                  <Input
                    id="promo"
                    value={code}
                    maxLength={20}
                    placeholder="GOLD20"
                    onChange={(e) => setCode(e.target.value)}
                    aria-invalid={!!error}
                    aria-describedby={error ? "promo-error" : undefined}
                  />
                  <Button type="submit" variant="outline" disabled={checking}>
                    {checking ? "Checking…" : "Apply"}
                  </Button>
                </div>
                {error ? (
                  <p id="promo-error" role="alert" className="mt-2 text-xs text-destructive">
                    {error}
                  </p>
                ) : null}
                {applied ? (
                  <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-success">
                    <Tag className="size-3.5" aria-hidden="true" />
                    {applied.code} applied ({Math.round(applied.rate * 100)}% off)
                  </p>
                ) : null}
              </form>

              <dl className="mt-7 space-y-3 border-t border-border pt-6 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd>{currency(totals.subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Discount</dt>
                  <dd className={totals.discount ? "text-success" : undefined}>
                    −{currency(totals.discount)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Shipping</dt>
                  <dd>{currency(totals.shipping)}</dd>
                </div>
                <div className="flex justify-between border-t border-border pt-4 text-base">
                  <dt className="font-display text-xl">Total</dt>
                  <dd className="font-display text-xl">{currency(totals.total)}</dd>
                </div>
              </dl>

              <Button asChild size="lg" className="mt-7 w-full">
                <Link to="/checkout">Continue to checkout</Link>
              </Button>
              <p className="mt-3 text-center text-[0.65rem] text-muted-foreground">
                Demo scaffold — no payment is taken.
              </p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
