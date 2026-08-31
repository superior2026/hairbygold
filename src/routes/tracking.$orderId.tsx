import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { MapPin, Package } from "lucide-react";
import { TrackingTimeline } from "@/components/tracking-timeline";
import { Button } from "@/components/ui/button";
import { orders, trackingIndexFor } from "@/lib/mock-data";
import { currency } from "@/lib/store";

export const Route = createFileRoute("/tracking/$orderId")({
  loader: ({ params }) => {
    const order = orders.find((o) => o.id === params.orderId);
    if (!order) throw notFound();
    return { order };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Order unavailable — Hair by Gold" }, { name: "robots", content: "noindex" }] };
    }
    return {
      meta: [
        { title: `Tracking #${loaderData.order.id} — Hair by Gold` },
        { name: "description", content: `Live status updates for Hair by Gold order ${loaderData.order.id}.` },
        { property: "og:title", content: `Tracking #${loaderData.order.id} — Hair by Gold` },
        { property: "og:description", content: "Follow your order from studio to doorstep." },
        { name: "robots", content: "noindex" },
      ],
    };
  },
  component: Tracking,
});

const updates = [
  { text: "Packed at the Lagos studio", place: "Lekki, Lagos", time: "Today, 14:05" },
  { text: "Courier collected the parcel", place: "Ikeja sorting hub", time: "Today, 18:40" },
  { text: "Departed origin facility", place: "Murtala Muhammed Intl.", time: "Tomorrow, 06:15" },
];

function Tracking() {
  const { order } = Route.useLoaderData();
  const idx = trackingIndexFor(order.status);

  return (
    <div className="mx-auto max-w-4xl px-5 py-12 lg:px-8">
      <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
        <Link to="/orders" className="hover:text-primary">
          Order history
        </Link>
        <span aria-hidden="true"> / </span>
        <span aria-current="page" className="text-foreground">
          #{order.id}
        </span>
      </nav>

      <header className="mt-6">
        <p className="text-[0.62rem] tracking-luxe text-primary">Tracking</p>
        <h1 className="mt-4 font-display text-5xl">Order #{order.id}</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {order.date} · {order.items} item{order.items === 1 ? "" : "s"} · {currency(order.total)} ·{" "}
          {order.method}
        </p>
      </header>

      <section aria-labelledby="latest" className="mt-10 rounded-sm surface-gold p-7">
        <h2 id="latest" className="inline-flex items-center gap-2 text-[0.62rem] tracking-luxe text-primary">
          <MapPin className="size-3.5" aria-hidden="true" />
          Current location
        </h2>
        <p className="mt-3 font-display text-3xl">{updates[Math.min(idx, updates.length - 1)]!.place}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          {updates[Math.min(idx, updates.length - 1)]!.text} ·{" "}
          {updates[Math.min(idx, updates.length - 1)]!.time}
        </p>
      </section>

      <div className="mt-10 grid gap-8 md:grid-cols-2">
        <section aria-labelledby="timeline" className="rounded-sm border border-border bg-card p-7">
          <h2 id="timeline" className="font-display text-2xl">
            Status timeline
          </h2>
          <div className="mt-6">
            <TrackingTimeline
              currentIndex={order.status === "Refunded" ? 0 : idx}
              dates={["Order placed", "Studio packing", "With courier", "Doorstep"]}
            />
          </div>
        </section>

        <section aria-labelledby="updates" className="rounded-sm border border-border bg-card p-7">
          <h2 id="updates" className="font-display text-2xl">
            Latest updates
          </h2>
          <ul className="mt-6 space-y-5">
            {updates.slice(0, Math.max(1, idx + 1)).map((u) => (
              <li key={u.text} className="flex gap-3">
                <Package className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                <div>
                  <p className="text-sm">{u.text}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {u.place} · {u.time}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <Button asChild variant="outline" className="mt-7 w-full">
            <Link to="/chat">Message the concierge</Link>
          </Button>
        </section>
      </div>
    </div>
  );
}
