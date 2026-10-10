import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/hooks/use-session";
import { getMyConversation, sendMyMessage } from "@/lib/studio.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Chat with the Studio — Hair by Gold" },
      {
        name: "description",
        content: "Message the Hair by Gold studio about wigs, installations and appointments.",
      },
      { property: "og:title", content: "Chat with the Studio — Hair by Gold" },
      {
        property: "og:description",
        content: "Ask about units, textures, installations and appointment times.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Chat,
});

const timeLabel = (iso: string) =>
  new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

function Chat() {
  const { session, ready } = useSession();
  return (
    <div className="mx-auto max-w-3xl px-5 py-14 lg:px-8">
      <header>
        <p className="text-[0.62rem] tracking-luxe text-primary">Concierge</p>
        <h1 className="mt-4 font-display text-4xl sm:text-5xl">Chat with the studio</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Your conversation is saved to your account, so you can pick it up on any device.
        </p>
      </header>
      {!ready ? (
        <Skeleton className="mt-10 h-40 w-full" />
      ) : !session ? (
        <div className="mt-10 rounded-sm border border-border bg-card p-6 text-sm">
          <p>Sign in to chat with the studio.</p>
          <div className="mt-4 flex gap-3">
            <Link to="/login" className="inline-flex h-10 items-center rounded-sm bg-primary px-4 text-primary-foreground">
              Sign in
            </Link>
            <Link to="/signup" className="inline-flex h-10 items-center rounded-sm border border-input px-4 hover:bg-secondary">
              Create account
            </Link>
          </div>
        </div>
      ) : (
        <Thread />
      )}
    </div>
  );
}

function Thread() {
  const load = useServerFn(getMyConversation);
  const send = useServerFn(sendMyMessage);
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["my-chat"],
    queryFn: () => load(),
    refetchInterval: 8000,
  });
  const messages = data?.messages ?? [];
  const [draft, setDraft] = useState("");
  const [failed, setFailed] = useState("");
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const body = draft.trim();
    if (!body) return;
    setDraft("");
    setFailed("");
    try {
      await send({ data: { body } });
      await queryClient.invalidateQueries({ queryKey: ["my-chat"] });
    } catch {
      setDraft(body);
      setFailed("Couldn't send — please try again.");
    }
  }

  return (
    <div className="mt-10 rounded-sm border border-border bg-card p-6">
      {isLoading ? (
        <Skeleton className="h-24 w-full" />
      ) : messages.length === 0 ? (
        <p className="text-sm text-muted-foreground">Say hello — the studio will reply here.</p>
      ) : (
        <ul className="max-h-[28rem] space-y-4 overflow-y-auto">
          {messages.map((m) => (
            <li key={m.id} className={cn("flex", m.sender === "customer" && "justify-end")}>
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-3 text-sm",
                  m.sender === "customer"
                    ? "rounded-br-sm bg-primary text-primary-foreground"
                    : "rounded-bl-sm bg-secondary text-secondary-foreground",
                )}
              >
                <p>{m.body}</p>
                <p className="mt-1.5 text-[0.65rem] opacity-75">{timeLabel(m.created_at)}</p>
              </div>
            </li>
          ))}
          <div ref={endRef} />
        </ul>
      )}
      {failed ? <p role="alert" className="mt-3 text-sm text-destructive">{failed}</p> : null}
      <form onSubmit={submit} className="mt-6 flex gap-2">
        <Input
          value={draft}
          maxLength={2000}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Write a message…"
          aria-label="Message the studio"
        />
        <Button type="submit" aria-label="Send message">
          <Send className="size-4" aria-hidden="true" />
        </Button>
      </form>
    </div>
  );
}
