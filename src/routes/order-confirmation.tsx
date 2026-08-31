import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, MapPin } from "lucide-react";
import { z } from "zod";
import { TrackingTimeline } from "@/components/tracking-timeline";
import { Button } from "@/components/ui/button";
import { orders } from "@/lib/mock-data";
import { currency, useStore } from "@/lib/store";

export const Route = createFileRoute("/order-confirmation")({
  validateSearch: z.object({ shipping: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Order Confirmed — Hair by Gold" },
      {
        name: "description",
        content: "Your Hair by Gold order is confirmed. Follow its progress from studio to doorstep.",
      },
      { property: "og:title", content: "Order Confirmed — Hair by Gold" },
      { property: "og:description", content: "Thank you — your order is confirmed and being prepared." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrderConfirmation,
});

function OrderConfirmation() {
  const { shipping } = Route.useSearch();
  const { cart, subtotal } = useStore();
  const order = orders[4]!;
  const shipCost = shipping === "overnight" ? 62 : shipping === "standard" ? 18 : 34;

  return (
    <div className="mx-auto max-w-4xl px-5 py-16 lg:px-8">
      <div className="text-center">
        <CheckCircle2 className="mx-auto size-9 text-success" aria-hidden="true" />
        <p className="mt-6 text-[0.62rem] tracking-luxe text-primary">Step 3 of 3</p>
        <h1 className="mt-4 font-display text-5xl">Order confirmed</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Thank you, Olamide. A receipt for order <strong>#{order.id}</strong> is on its way to your
          inbox.
        </p>
      </div>

      <div className="mt-14 grid gap-8 md:grid-cols-2">
        <section
          aria-labelledby="order-details"
          className="rounded-sm border border-border bg-card p-7"
        >
          <h2 id="order-details" className="font-display text-2xl">
            Order details
          </h2>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Order number</dt>
              <dd>#{order.id}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Items</dt>
              <dd>{cart.reduce((n, l) => n + l.qty, 0)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Shipping</dt>
              <dd className="capitalize">{shipping ?? "express"}</dd>
            </div>
            <div className="flex justify-between border-t border-border pt-4">
              <dt className="font-display text-xl">Total paid</dt>
              <dd className="font-display text-xl">{currency(subtotal + shipCost)}</dd>
            </div>
          </dl>
          <ul className="mt-6 space-y-3 border-t border-border pt-5">
            {cart.map((l) => (
              <li key={l.product.id} className="flex items-center gap-3">
                <img
                  src={l.product.image}
                  alt=""
                  loading="lazy"
                  width={1024}
                  height={1024}
                  className="size-12 rounded-sm object-cover"
                />
                <span className="min-w-0 flex-1 truncate text-sm">{l.product.name}</span>
                <span className="text-xs text-muted-foreground">×{l.qty}</span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="tracking" className="rounded-sm border border-border bg-card p-7">
          <h2 id="tracking" className="font-display text-2xl">
            Tracking
          </h2>
          <div className="mt-5 rounded-sm surface-gold p-5">
            <p className="inline-flex items-center gap-2 text-[0.62rem] tracking-luxe text-primary">
              <MapPin className="size-3.5" aria-hidden="true" />
              Latest update
            </p>
            <p className="mt-2 text-sm">Packed at the Lagos studio · awaiting courier pickup</p>
            <p className="mt-1 text-xs text-muted-foreground">Today, 14:05 WAT</p>
          </div>
          <div className="mt-7">
            <TrackingTimeline
              currentIndex={1}
              dates={["Today, 13:58", "Today, 14:05", "Est. tomorrow", "Est. in 3 days"]}
            />
          </div>
          <Button asChild variant="outline" className="mt-7 w-full">
            <Link to="/tracking/$orderId" params={{ orderId: order.id }}>
              Track this order
            </Link>
          </Button>
        </section>
      </div>

      <div className="mt-12 flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link to="/orders">View order history</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/explore">Continue shopping</Link>
        </Button>
      </div>
    </div>
  );
}
