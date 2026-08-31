import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { RowsSkeleton } from "@/components/skeletons";
import { useFakeLoading } from "@/hooks/use-fake-loading";
import { orders, trackingSteps, trackingIndexFor } from "@/lib/mock-data";
import { currency } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "Order History — Hair by Gold" },
      { name: "description", content: "Every Hair by Gold order you've placed, with live mock status updates." },
      { property: "og:title", content: "Order History — Hair by Gold" },
      { property: "og:description", content: "Past orders with status updates and tracking." },
    ],
  }),
  component: Orders,
});

const statusTone: Record<string, string> = {
  Delivered: "text-success",
  "In transit": "text-primary",
  Processing: "text-primary",
  Refunded: "text-muted-foreground",
};

function Orders() {
  const loading = useFakeLoading(800);

  return (
    <div className="mx-auto max-w-5xl px-5 py-12 lg:px-8">
      <header>
        <p className="text-[0.62rem] tracking-luxe text-primary">Your account</p>
        <h1 className="mt-4 font-display text-5xl">Order history</h1>
      </header>

      <div className="mt-10" aria-busy={loading}>
        {loading ? (
          <RowsSkeleton rows={5} />
        ) : (
          <ul className="space-y-4">
            {orders.map((o) => {
              const idx = trackingIndexFor(o.status);
              return (
                <li key={o.id} className="rounded-sm border border-border bg-card p-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="font-display text-2xl">#{o.id}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {o.date} · {o.items} item{o.items === 1 ? "" : "s"} · {o.method}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">{currency(o.total)}</p>
                      <p className={cn("mt-1 text-xs", statusTone[o.status])}>{o.status}</p>
                    </div>
                  </div>

                  <ol className="mt-6 flex items-center gap-2" aria-label={`Progress for order ${o.id}`}>
                    {trackingSteps.map((s, i) => (
                      <li key={s} className="flex-1">
                        <span
                          aria-hidden="true"
                          className={cn(
                            "block h-1 rounded-full",
                            i <= idx && o.status !== "Refunded" ? "bg-primary" : "bg-secondary",
                          )}
                        />
                        <span className="mt-2 block text-[0.6rem] text-muted-foreground">{s}</span>
                      </li>
                    ))}
                  </ol>

                  <div className="mt-6 flex gap-3">
                    <Button asChild variant="outline" size="sm">
                      <Link to="/tracking/$orderId" params={{ orderId: o.id }}>
                        Track order
                      </Link>
                    </Button>
                    <Button asChild variant="ghost" size="sm">
                      <Link to="/help">Need help?</Link>
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
