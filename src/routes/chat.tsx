import { createFileRoute } from "@tanstack/react-router";
import { Check, CheckCheck, Paperclip, Send } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ConversationListSkeleton, MessagesSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { conversations, messagesByConversation, type Message } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { useFakeLoading } from "@/hooks/use-fake-loading";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Concierge Chat — Hair by Gold" },
      { name: "description", content: "Message the Hair by Gold styling concierge about units, colour and orders." },
      { property: "og:title", content: "Concierge Chat — Hair by Gold" },
      { property: "og:description", content: "Chat with stylists about units, colour matching and orders." },
    ],
  }),
  component: Chat,
});

function Chat() {
  const [activeId, setActiveId] = useState(conversations[0]!.id);
  const listLoading = useFakeLoading(700);
  const threadLoading = useFakeLoading(600, [activeId]);
  const [drafts, setDrafts] = useState<Record<string, Message[]>>({});
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const active = conversations.find((c) => c.id === activeId)!;
  const thread = useMemo(
    () => [...(messagesByConversation[activeId] ?? []), ...(drafts[activeId] ?? [])],
    [activeId, drafts],
  );

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread.length, typing, threadLoading]);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const value = text.trim().slice(0, 500);
    if (!value) return;
    const stamp = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    setDrafts((prev) => ({
      ...prev,
      [activeId]: [...(prev[activeId] ?? []), { id: `d${Date.now()}`, from: "me", text: value, time: stamp }],
    }));
    setText("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setDrafts((prev) => ({
        ...prev,
        [activeId]: [
          ...(prev[activeId] ?? []),
          {
            id: `r${Date.now()}`,
            from: "them",
            text: "Noted — I'll check the studio and come right back to you.",
            time: stamp,
          },
        ],
      }));
    }, 2200);
  };

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
      <header>
        <p className="text-[0.62rem] tracking-luxe text-primary">Concierge</p>
        <h1 className="mt-4 font-display text-5xl">Messages</h1>
      </header>

      <div className="mt-10 grid overflow-hidden rounded-sm border border-border bg-card lg:grid-cols-[20rem_1fr]">
        <section
          aria-label="Conversations"
          className="border-b border-border lg:border-b-0 lg:border-r"
          aria-busy={listLoading}
        >
          {listLoading ? (
            <ConversationListSkeleton />
          ) : (
            <ul className="max-h-[30rem] overflow-y-auto p-2">
              {conversations.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    aria-current={c.id === activeId}
                    onClick={() => setActiveId(c.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-sm p-3 text-left transition focus-visible:ring-2 focus-visible:ring-ring/50",
                      c.id === activeId ? "bg-secondary" : "hover:bg-secondary/60",
                    )}
                  >
                    <span className="relative">
                      <span
                        aria-hidden="true"
                        className="grid size-11 place-items-center rounded-full bg-background text-xs"
                      >
                        {c.initials}
                      </span>
                      {c.online ? (
                        <span
                          className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-card bg-success"
                          aria-label="Online"
                          role="img"
                        />
                      ) : null}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium">{c.name}</span>
                        <span className="ml-auto shrink-0 text-[0.65rem] text-muted-foreground">{c.time}</span>
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-muted-foreground">{c.preview}</span>
                    </span>
                    {c.unread ? (
                      <span className="grid size-5 shrink-0 place-items-center rounded-full bg-primary text-[0.6rem] text-primary-foreground">
                        {c.unread}
                      </span>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-label={`Conversation with ${active.name}`} className="flex min-h-[30rem] flex-col">
          <div className="flex items-center gap-3 border-b border-border p-5">
            <span aria-hidden="true" className="grid size-10 place-items-center rounded-full bg-secondary text-xs">
              {active.initials}
            </span>
            <div>
              <h2 className="font-display text-xl leading-none">{active.name}</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {active.online ? "Online now" : active.role}
              </p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6" aria-busy={threadLoading} aria-live="polite">
            {threadLoading ? (
              <MessagesSkeleton />
            ) : (
              <ul className="space-y-4">
                {thread.map((m, i) => (
                  <li key={m.id} className={cn("flex", m.from === "me" && "justify-end")}>
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                        m.from === "me"
                          ? "rounded-br-sm bg-primary text-primary-foreground"
                          : "rounded-bl-sm bg-secondary text-secondary-foreground",
                      )}
                    >
                      <p>{m.text}</p>
                      <p
                        className={cn(
                          "mt-1.5 flex items-center gap-1 text-[0.65rem]",
                          m.from === "me" ? "justify-end text-primary-foreground/75" : "text-muted-foreground",
                        )}
                      >
                        {m.time}
                        {m.from === "me" ? (
                          i === thread.length - 1 ? (
                            <Check className="size-3" aria-label="Sent" />
                          ) : (
                            <CheckCheck className="size-3" aria-label="Seen" />
                          )
                        ) : null}
                      </p>
                    </div>
                  </li>
                ))}
                {typing ? (
                  <li className="flex">
                    <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm bg-secondary px-4 py-3">
                      <span className="sr-only">{active.name} is typing</span>
                      {[0, 150, 300].map((d) => (
                        <span
                          key={d}
                          aria-hidden="true"
                          className="size-1.5 animate-bounce rounded-full bg-muted-foreground"
                          style={{ animationDelay: `${d}ms` }}
                        />
                      ))}
                    </div>
                  </li>
                ) : null}
              </ul>
            )}
            <div ref={endRef} />
          </div>

          <form onSubmit={send} className="flex items-center gap-2 border-t border-border p-4">
            <Button type="button" variant="ghost" size="icon" className="min-h-11 min-w-11" aria-label="Attach a photo">
              <Paperclip className="size-4" aria-hidden="true" />
            </Button>
            <label htmlFor="message" className="sr-only">
              Write a message
            </label>
            <Input
              id="message"
              value={text}
              maxLength={500}
              placeholder="Write a message…"
              onChange={(e) => setText(e.target.value)}
            />
            <Button type="submit" size="icon" className="min-h-11 min-w-11" aria-label="Send message">
              <Send className="size-4" aria-hidden="true" />
            </Button>
          </form>
        </section>
      </div>
    </div>
  );
}
