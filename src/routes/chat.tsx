import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Send } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  getConversation,
  sendCustomerMessage,
  startConversation,
  type PublicMessage,
} from "@/lib/studio.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Chat with the Studio — Hair by Gold" },
      {
        name: "description",
        content:
          "Message the Hair by Gold studio about wigs, installations and appointments — no account needed.",
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
  component: Chat;
});

const TOKEN_KEY = "hbg-chat-token";

const introSchema = z.object({
  name: z.string().trim().min(2, "Tell us your name").max(80),
  contact: z.string().trim().min(5, "Add a phone number or email").max(120),
  message: z.string().trim().min(2, "Write your question").max(2000),
});

const timeLabel = (iso: string) =>
  new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

function Chat() {
  const start = useServerFn(startConversation);
  const load = useServerFn(getConversation);
  const send = useServerFn(sendCustomerMessage);

  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [messages, setMessages] = useState<PublicMessage[]>([]);
  const [intro, setIntro] = useState({ name: "", contact: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  const refresh = useCallback(
    async (activeToken: string) => {
      const result = await load({ data: { token: activeToken } });
      if (!result.found) {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setMessages([]);
        return;
      }
      setMessages(result.messages);
    },
    [load],
  );

  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (!stored) {
      setReady(true);
      return;
    }
    setToken(stored);
    void refresh(stored).finally(() => setReady(true));
  }, [refresh]);

  useEffect(() => {
    if (!token) return;
    const id = setInterval(() => void refresh(token), 8000);
    return () => clearInterval(id);
  }, [token, refresh]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  async function beginChat(e: React.FormEvent) {
    e.preventDefault();
    const parsed = introSchema.safeParse(intro);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0]);
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    setBusy(true);
    try {
      const { token: newToken } = await start({ data: parsed.data });
      localStorage.setItem(TOKEN_KEY, newToken);
      setToken(newToken);
      await refresh(newToken);
    } finally {
      setBusy(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !draft.trim()) return;
    const body = draft.trim();
    setDraft("");
    await send({ data: { token, body } });
    await refresh(token);
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-14 lg:px-8">
      <header>
        <p className="text-[0.62rem] tracking-luxe text-primary">Concierge</p>
        <h1 className="mt-4 font-display text-4xl sm:text-5xl">Chat with the studio</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Send a message and the studio will reply here. Keep this page bookmarked on this device to
          follow the conversation.
        </p>
      </header>

      {!ready ? (
        <div className="mt-10 space-y-3">
          <Skeleton className="h-16 w-2/3" />
          <Skeleton className="h-16 w-1/2" />
        </div>
      ) : !token ? (
        <form
          onSubmit={beginChat}
          noValidate
          className="mt-10 space-y-4 rounded-sm border border-border bg-card p-6"
        >
          <div>
            <Label htmlFor="c-name">Your name</Label>
            <Input
              id="c-name"
              className="mt-2"
              value={intro.name}
              aria-invalid={Boolean(errors["name"])}
              onChange={(e) => setIntro((v) => ({ ...v, name: e.target.value }))}
            />
            {errors["name"] ? <p className="mt-1 text-xs text-destructive">{errors["name"]}</p> : null}
          </div>
          <div>
            <Label htmlFor="c-contact">Phone or email</Label>
            <Input
              id="c-contact"
              className="mt-2"
              value={intro.contact}
              aria-invalid={Boolean(errors["contact"])}
              onChange={(e) => setIntro((v) => ({ ...v, contact: e.target.value }))}
            />
            {errors["contact"] ? (
              <p className="mt-1 text-xs text-destructive">{errors["contact"]}</p>
            ) : null}
          </div>
          <div>
            <Label htmlFor="c-message">How can we help?</Label>
            <Textarea
              id="c-message"
              rows={4}
              className="mt-2"
              value={intro.message}
              aria-invalid={Boolean(errors["message"])}
              onChange={(e) => setIntro((v) => ({ ...v, message: e.target.value }))}
            />
            {errors["message"] ? (
              <p className="mt-1 text-xs text-destructive">{errors["message"]}</p>
            ) : null}
          </div>
          <Button type="submit" disabled={busy}>
            {busy ? "Sending…" : "Start chat"}
          </Button>
        </form>
      ) : (
        <div className="mt-10 rounded-sm border border-border bg-card p-6">
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
          <form onSubmit={submit} className="mt-6 flex gap-2">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Write a message…"
              aria-label="Message the studio"
            />
            <Button type="submit" aria-label="Send message">
              <Send className="size-4" aria-hidden="true" />
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
