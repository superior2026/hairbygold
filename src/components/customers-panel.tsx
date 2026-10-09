import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { listCustomers } from "@/lib/owner.functions";
import { cn } from "@/lib/utils";

const dateLabel = (d: string) =>
  new Date(d).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

export function CustomersPanel() {
  const fetchCustomers = useServerFn(listCustomers);
  const { data, isLoading } = useQuery({
    queryKey: ["owner-customers"],
    queryFn: () => fetchCustomers(),
    refetchInterval: 15000,
  });
  const [active, setActive] = useState<string | null>(null);
  const customers = data ?? [];
  const current = customers.find((c) => c.id === active) ?? customers[0];

  return (
    <div>
      <h2 className="font-display text-2xl">Customers</h2>
      <div className="mt-5 grid gap-6 lg:grid-cols-[22rem_1fr]">
        <ul className="space-y-2" aria-busy={isLoading}>
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
          ) : customers.length === 0 ? (
            <li className="rounded-sm border border-border bg-card p-5 text-sm text-muted-foreground">
              No customer accounts yet.
            </li>
          ) : (
            customers.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  aria-current={current?.id === c.id}
                  onClick={() => setActive(c.id)}
                  className={cn(
                    "w-full rounded-sm border p-4 text-left transition focus-visible:ring-2 focus-visible:ring-ring/50",
                    current?.id === c.id ? "border-primary bg-secondary" : "border-border bg-card hover:bg-secondary",
                  )}
                >
                  <span className="block text-sm font-medium">{c.full_name || c.email}</span>
                  <span className="block text-xs text-muted-foreground">
                    {c.bookings.length} booking{c.bookings.length === 1 ? "" : "s"}
                    {c.conversation ? " · has chatted" : ""}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>

        {current ? (
          <section className="rounded-sm border border-border bg-card p-6" aria-label="Customer profile">
            <h3 className="font-display text-2xl">{current.full_name || "No name yet"}</h3>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-muted-foreground">Email</dt>
                <dd>{current.email || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Phone</dt>
                <dd>{current.phone || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Joined</dt>
                <dd>{dateLabel(current.created_at)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Chat</dt>
                <dd>
                  {current.conversation
                    ? `Last message ${dateLabel(current.conversation.last_message_at)} — see Messages`
                    : "No messages yet"}
                </dd>
              </div>
              {current.hair_notes ? (
                <div className="sm:col-span-2">
                  <dt className="text-xs text-muted-foreground">Hair notes</dt>
                  <dd>{current.hair_notes}</dd>
                </div>
              ) : null}
            </dl>
            <h4 className="mt-6 font-display text-xl">Booking history</h4>
            {current.bookings.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">No bookings yet.</p>
            ) : (
              <ul className="mt-3 divide-y divide-border">
                {current.bookings.map((b: any) => (
                  <li key={b.id} className="flex items-center justify-between gap-4 py-3 text-sm">
                    <span>
                      <span className="block font-medium">{b.service_name}</span>
                      <span className="block text-xs text-muted-foreground">
                        {dateLabel(b.preferred_date)} {b.preferred_time}
                      </span>
                    </span>
                    <span className="rounded-sm bg-secondary px-2 py-1 text-xs capitalize">{b.status}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ) : null}
      </div>
    </div>
  );
}
