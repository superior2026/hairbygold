import { createFileRoute } from "@tanstack/react-router";
import { Bell, MessageCircle, Package, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RowsSkeleton } from "@/components/skeletons";
import { useFakeLoading } from "@/hooks/use-fake-loading";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — Hair by Gold" },
      { name: "description", content: "Order updates, concierge chat mentions and members-only offers." },
      { property: "og:title", content: "Notifications — Hair by Gold" },
      { property: "og:description", content: "Order updates, chat mentions and promotional alerts." },
    ],
  }),
  component: Notifications,
});

const icons = { order: Package, chat: MessageCircle, promo: Sparkles };

function Notifications() {
  const { notifications, unreadCount, markRead, markAllRead } = useStore();
  const loading = useFakeLoading(700);

  return (
    <div className="mx-auto max-w-3xl px-5 py-12 lg:px-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[0.62rem] tracking-luxe text-primary">Activity</p>
          <h1 className="mt-4 font-display text-5xl">Notifications</h1>
          <p className="mt-3 text-sm text-muted-foreground" role="status">
            {unreadCount} unread
          </p>
        </div>
        <Button variant="outline" onClick={markAllRead} disabled={!unreadCount}>
          Mark all as read
        </Button>
      </header>

      <div className="mt-10" aria-busy={loading}>
        {loading ? (
          <RowsSkeleton rows={4} />
        ) : (
          <ul className="space-y-3">
            {notifications.map((n) => {
              const Icon = icons[n.kind];
              return (
                <li
                  key={n.id}
                  className={cn(
                    "flex gap-4 rounded-sm border p-5 transition",
                    n.read ? "border-border bg-card" : "border-primary/40 surface-gold",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className="grid size-10 shrink-0 place-items-center rounded-full bg-background text-primary"
                  >
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-3">
                      <h2 className="font-display text-xl leading-tight">{n.title}</h2>
                      {!n.read ? (
                        <span className="ml-auto shrink-0 rounded-sm bg-primary px-2 py-0.5 text-[0.6rem] tracking-luxe text-primary-foreground">
                          New
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1.5 text-sm text-muted-foreground">{n.body}</p>
                    <div className="mt-3 flex items-center gap-4">
                      <span className="text-xs text-muted-foreground">{n.time}</span>
                      {!n.read ? (
                        <button
                          type="button"
                          onClick={() => markRead(n.id)}
                          className="rounded-sm text-xs text-primary hover:underline focus-visible:ring-2 focus-visible:ring-ring/50"
                        >
                          Mark as read
                        </button>
                      ) : null}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        {!loading && notifications.length === 0 ? (
          <div className="rounded-sm border border-dashed border-border p-16 text-center">
            <Bell className="mx-auto size-6 text-primary" aria-hidden="true" />
            <p className="mt-4 text-sm text-muted-foreground">You're all caught up.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
