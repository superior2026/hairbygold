import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Pencil, Plus, Send, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { categories, lengths, textures } from "@/lib/mock-data";
import {
  claimOwnerAccount,
  deleteProduct,
  getConversationThread,
  getOwnerStatus,
  listBookings,
  listConversations,
  listOwnerProducts,
  replyToConversation,
  saveProduct,
  updateBookingStatus,
} from "@/lib/owner.functions";
import { imageKeys, productImage } from "@/lib/product-images";
import { listCatalog } from "@/lib/catalog.functions";
import { currency } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Owner Dashboard — Hair by Gold" },
      {
        name: "description",
        content:
          "Manage the Hair by Gold catalogue, read customer messages and review booking requests.",
      },
      { property: "og:title", content: "Owner Dashboard — Hair by Gold" },
      {
        property: "og:description",
        content: "Add, edit and remove products, reply to customers and confirm appointments.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Dashboard,
});

type ProductRow = {
  id: string;
  name: string;
  price: number | string;
  category: string;
  length: string;
  texture: string;
  description: string;
  in_stock: boolean;
  image_key: string;
  image_url: string | null;
};

type ConversationRow = {
  id: string;
  customer_name: string;
  contact: string;
  last_message_at: string;
  unread_for_owner: boolean;
};

type MessageRow = { id: string; sender: string; body: string; created_at: string };

type BookingRow = {
  id: string;
  service_name: string;
  customer_name: string;
  contact: string;
  preferred_date: string;
  preferred_time: string;
  notes: string;
  status: string;
  created_at: string;
};

type Draft = {
  name: string;
  price: string;
  category: string;
  length: string;
  texture: string;
  description: string;
  inStock: boolean;
  imageKey: string;
  imageUrl: string | null;
  file: File | null;
};

const emptyDraft: Draft = {
  name: "",
  price: "",
  category: "Lace Front Wigs",
  length: '20"',
  texture: "Straight",
  description: "",
  inStock: true,
  imageKey: "product-1",
  imageUrl: null,
  file: null,
};

const selectCls =
  "h-11 w-full rounded-sm border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50";

const timeLabel = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

function Dashboard() {
  const navigate = useNavigate();
  const status = useServerFn(getOwnerStatus);
  const claim = useServerFn(claimOwnerAccount);
  const fetchProducts = useServerFn(listOwnerProducts);
  const persistProduct = useServerFn(saveProduct);
  const removeProduct = useServerFn(deleteProduct);
  const fetchConversations = useServerFn(listConversations);
  const fetchThread = useServerFn(getConversationThread);
  const sendReply = useServerFn(replyToConversation);
  const fetchBookings = useServerFn(listBookings);
  const setBookingStatus = useServerFn(updateBookingStatus);

  const [checking, setChecking] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<ProductRow[]>([]);
  const [conversations, setConversations] = useState<ConversationRow[]>([]);
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [activeThread, setActiveThread] = useState<string | null>(null);
  const [thread, setThread] = useState<MessageRow[]>([]);
  const [reply, setReply] = useState("");
  const [editing, setEditing] = useState<ProductRow | null>(null);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [flash, setFlash] = useState("");
  const [photos, setPhotos] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const catalog = useServerFn(listCatalog);
  const refreshPhotos = useCallback(async () => {
    const list = await catalog();
    setPhotos(Object.fromEntries(list.map((p) => [p.id, p.image])));
  }, [catalog]);

  const loadAll = useCallback(async () => {
    const [p, c, b] = await Promise.all([fetchProducts(), fetchConversations(), fetchBookings()]);
    setItems(p as ProductRow[]);
    setConversations(c as ConversationRow[]);
    setBookings(b as BookingRow[]);
    setLoading(false);
    void refreshPhotos();
  }, [fetchProducts, fetchConversations, fetchBookings, refreshPhotos]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const result = await status();
        if (cancelled) return;
        setIsOwner(result.isOwner);
        setChecking(false);
        if (result.isOwner) await loadAll();
      } catch {
        if (!cancelled) setChecking(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [status, loadAll]);

  useEffect(() => {
    if (!isOwner) return;
    const id = setInterval(() => {
      void fetchConversations().then((c) => setConversations(c as ConversationRow[]));
      if (activeThread) {
        void fetchThread({ data: { conversationId: activeThread } }).then((t) =>
          setThread(t as MessageRow[]),
        );
      }
    }, 10000);
    return () => clearInterval(id);
  }, [isOwner, activeThread, fetchConversations, fetchThread]);

  const stats = useMemo(
    () => ({
      total: items.length,
      inStock: items.filter((p) => p.in_stock).length,
      value: items.reduce((n, p) => n + Number(p.price), 0),
      unread: conversations.filter((c) => c.unread_for_owner).length,
      bookings: bookings.filter((b) => b.status === "new").length,
    }),
    [items, conversations, bookings],
  );

  async function openThread(id: string) {
    setActiveThread(id);
    const t = await fetchThread({ data: { conversationId: id, markRead: true } });
    setThread(t as MessageRow[]);
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread_for_owner: false } : c)),
    );
  }

  async function submitReply(e: React.FormEvent) {
    e.preventDefault();
    if (!activeThread || !reply.trim()) return;
    await sendReply({ data: { conversationId: activeThread, body: reply.trim() } });
    setReply("");
    const t = await fetchThread({ data: { conversationId: activeThread } });
    setThread(t as MessageRow[]);
  }

  const startCreate = () => {
    setEditing(null);
    setDraft(emptyDraft);
    setErrors({});
    setOpen(true);
  };

  const startEdit = (p: ProductRow) => {
    setEditing(p);
    setDraft({
      name: p.name,
      price: String(p.price),
      category: p.category,
      length: p.length,
      texture: p.texture,
      description: p.description,
      inStock: p.in_stock,
      imageKey: p.image_key,
      imageUrl: p.image_url,
      file: null,
    });
    setErrors({});
    setOpen(true);
  };

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (draft.name.trim().length < 3) next["name"] = "Give the product a name of at least 3 characters.";
    const price = Number(draft.price);
    if (!draft.price.trim() || Number.isNaN(price) || price <= 0)
      next["price"] = "Enter a price greater than 0.";
    if (draft.description.trim().length < 10)
      next["description"] = "Add a short description (10+ characters).";
    if (draft.file) {
      if (!["image/jpeg", "image/png", "image/webp"].includes(draft.file.type))
        next["file"] = "Use a JPG, PNG or WEBP photo.";
      else if (draft.file.size > 5 * 1024 * 1024) next["file"] = "Photos must be 5 MB or smaller.";
    }
    setErrors(next);
    if (Object.keys(next).length) return;

    setSaving(true);
    let imageUrl = draft.imageUrl;
    if (draft.file) {
      const ext = draft.file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `products/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from("product-images")
        .upload(path, draft.file, { contentType: draft.file.type });
      if (error) {
        setErrors({ file: "Upload failed — please try again." });
        setSaving(false);
        return;
      }
      imageUrl = path;
    }

    await persistProduct({
      data: {
        ...(editing ? { id: editing.id } : {}),
        name: draft.name.trim(),
        price,
        category: draft.category,
        length: draft.length,
        texture: draft.texture,
        description: draft.description.trim(),
        in_stock: draft.inStock,
        image_key: draft.imageKey,
        image_url: imageUrl,
      },
    });
    setSaving(false);
    setFlash(editing ? `Saved changes to “${draft.name.trim()}”.` : `Added “${draft.name.trim()}”.`);
    setOpen(false);
    setItems((await fetchProducts()) as ProductRow[]);
    void refreshPhotos();
  }

  async function remove(p: ProductRow) {
    await removeProduct({ data: { id: p.id } });
    setFlash(`Removed “${p.name}”.`);
    setItems((await fetchProducts()) as ProductRow[]);
  }

  async function changeBooking(id: string, next: "confirmed" | "declined" | "done") {
    await setBookingStatus({ data: { id, status: next } });
    setBookings((await fetchBookings()) as BookingRow[]);
  }

  async function signOut() {
    await supabase.auth.signOut();
    void navigate({ to: "/login", replace: true });
  }

  if (checking) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-5 py-16 lg:px-8">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="mx-auto max-w-lg px-5 py-20 text-center lg:px-8">
        <h1 className="font-display text-4xl">Owner access only</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          This account is not the studio owner. If this is your studio and no owner has been set up
          yet, claim it once below — after that no other account can take it.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button
            onClick={async () => {
              const result = await claim();
              if (result.claimed) {
                setIsOwner(true);
                await loadAll();
              } else {
                setFlash("The studio already has an owner.");
              }
            }}
          >
            Claim studio ownership
          </Button>
          <Button variant="outline" onClick={signOut}>
            Sign out
          </Button>
        </div>
        {flash ? (
          <p role="status" className="mt-5 text-sm text-destructive">
            {flash}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[0.62rem] tracking-luxe text-primary">Owner area</p>
          <h1 className="mt-4 font-display text-5xl">Dashboard</h1>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">
            Your catalogue, customer messages and appointment requests — saved securely and visible
            only to you.
          </p>
        </div>
        <Button variant="outline" onClick={signOut}>
          Sign out
        </Button>
      </header>

      <dl className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: "Products", value: String(stats.total) },
          { label: "In stock", value: String(stats.inStock) },
          { label: "Catalogue value", value: currency(stats.value) },
          { label: "Unread messages", value: String(stats.unread) },
          { label: "New bookings", value: String(stats.bookings) },
        ].map((s) => (
          <div key={s.label} className="rounded-sm border border-border bg-card p-5">
            <dt className="text-[0.62rem] tracking-luxe text-muted-foreground">{s.label}</dt>
            <dd className="mt-2 font-display text-3xl">{s.value}</dd>
          </div>
        ))}
      </dl>

      {flash ? (
        <p role="status" className="mt-6 rounded-sm border border-primary/40 bg-primary/10 px-4 py-3 text-sm">
          {flash}
        </p>
      ) : null}

      <Tabs defaultValue="products" className="mt-10">
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="mt-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display text-2xl">Catalogue</h2>
            <Button onClick={startCreate}>
              <Plus className="size-4" aria-hidden="true" /> Add product
            </Button>
          </div>

          <div className="mt-5 overflow-hidden rounded-sm border border-border bg-card" aria-busy={loading}>
            {loading ? (
              <div className="space-y-3 p-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[42rem] text-sm">
                  <caption className="sr-only">Products you can edit or remove</caption>
                  <thead className="border-b border-border text-left text-[0.62rem] tracking-luxe text-muted-foreground">
                    <tr>
                      <th scope="col" className="p-4">Product</th>
                      <th scope="col" className="p-4">Category</th>
                      <th scope="col" className="p-4">Price</th>
                      <th scope="col" className="p-4">Stock</th>
                      <th scope="col" className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((p) => (
                      <tr key={p.id} className="border-b border-border/60 last:border-0">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={photos[p.id] ?? productImage(p.image_key)}
                              alt=""
                              width={48}
                              height={48}
                              loading="lazy"
                              className="size-12 rounded-sm object-cover"
                            />
                            <div>
                              <p className="font-medium">{p.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {p.texture} · {p.length}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-muted-foreground">{p.category}</td>
                        <td className="p-4">{currency(Number(p.price))}</td>
                        <td className="p-4">
                          <span
                            className={cn(
                              "rounded-full px-2 py-1 text-[0.65rem]",
                              p.in_stock ? "bg-success/15 text-success" : "bg-muted text-muted-foreground",
                            )}
                          >
                            {p.in_stock ? "In stock" : "Sold out"}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              aria-label={`Edit ${p.name}`}
                              onClick={() => startEdit(p)}
                            >
                              <Pencil className="size-4" aria-hidden="true" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`Remove ${p.name}`}
                              onClick={() => void remove(p)}
                            >
                              <Trash2 className="size-4" aria-hidden="true" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-sm text-muted-foreground">
                          No products yet — add your first one.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="messages" className="mt-6">
          <h2 className="font-display text-2xl">Incoming messages</h2>
          <div className="mt-5 grid gap-6 lg:grid-cols-[22rem_1fr]">
            <ul className="space-y-2" aria-busy={loading}>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)
              ) : conversations.length === 0 ? (
                <li className="rounded-sm border border-border bg-card p-5 text-sm text-muted-foreground">
                  No customer messages yet.
                </li>
              ) : (
                conversations.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      aria-current={activeThread === c.id}
                      onClick={() => void openThread(c.id)}
                      className={cn(
                        "w-full rounded-sm border p-4 text-left transition focus-visible:ring-2 focus-visible:ring-ring/50",
                        activeThread === c.id
                          ? "border-primary bg-secondary"
                          : "border-border bg-card hover:bg-secondary/60",
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-sm font-medium">{c.customer_name}</span>
                        {c.unread_for_owner ? (
                          <span className="rounded-full bg-primary px-2 py-0.5 text-[0.6rem] text-primary-foreground">
                            New
                          </span>
                        ) : null}
                        <span className="ml-auto text-[0.65rem] text-muted-foreground">
                          {timeLabel(c.last_message_at)}
                        </span>
                      </span>
                      <span className="mt-1 block text-xs text-muted-foreground">{c.contact}</span>
                    </button>
                  </li>
                ))
              )}
            </ul>

            <div className="rounded-sm border border-border bg-card p-6">
              {activeThread ? (
                <>
                  <ul className="space-y-4">
                    {thread.map((m) => (
                      <li key={m.id} className={cn("flex", m.sender === "owner" && "justify-end")}>
                        <div
                          className={cn(
                            "max-w-[80%] rounded-2xl px-4 py-3 text-sm",
                            m.sender === "owner"
                              ? "rounded-br-sm bg-primary text-primary-foreground"
                              : "rounded-bl-sm bg-secondary text-secondary-foreground",
                          )}
                        >
                          <p>{m.body}</p>
                          <p className="mt-1.5 text-[0.65rem] opacity-75">{timeLabel(m.created_at)}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <form onSubmit={submitReply} className="mt-6 flex gap-2">
                    <Input
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      placeholder="Write a reply…"
                      aria-label="Reply to customer"
                    />
                    <Button type="submit" aria-label="Send reply">
                      <Send className="size-4" aria-hidden="true" />
                    </Button>
                  </form>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Select a conversation to read the full message thread and reply.
                </p>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="bookings" className="mt-6">
          <h2 className="font-display text-2xl">Appointment requests</h2>
          <ul className="mt-5 space-y-3" aria-busy={loading}>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
            ) : bookings.length === 0 ? (
              <li className="rounded-sm border border-border bg-card p-5 text-sm text-muted-foreground">
                No booking requests yet.
              </li>
            ) : (
              bookings.map((b) => (
                <li key={b.id} className="rounded-sm border border-border bg-card p-5">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <p className="font-display text-xl">{b.service_name}</p>
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-[0.65rem] capitalize">
                      {b.status}
                    </span>
                    <span className="ml-auto text-xs text-muted-foreground">
                      {timeLabel(b.created_at)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm">
                    {b.customer_name} · {b.contact}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Preferred: {b.preferred_date}
                    {b.preferred_time ? ` at ${b.preferred_time}` : ""}
                  </p>
                  {b.notes ? <p className="mt-2 text-sm text-muted-foreground">“{b.notes}”</p> : null}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => void changeBooking(b.id, "confirmed")}>
                      Confirm
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => void changeBooking(b.id, "done")}>
                      Mark done
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => void changeBooking(b.id, "declined")}>
                      Decline
                    </Button>
                  </div>
                </li>
              ))
            )}
          </ul>
        </TabsContent>
      </Tabs>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit product" : "Add product"}</DialogTitle>
            <DialogDescription>
              Saved to your studio account, so it stays after you close the browser.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={save} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="p-name">Product name</Label>
              <Input
                id="p-name"
                value={draft.name}
                aria-invalid={Boolean(errors["name"])}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              />
              {errors["name"] ? <p className="text-xs text-destructive">{errors["name"]}</p> : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="p-price">Price (USD)</Label>
                <Input
                  id="p-price"
                  inputMode="decimal"
                  value={draft.price}
                  aria-invalid={Boolean(errors["price"])}
                  onChange={(e) => setDraft((d) => ({ ...d, price: e.target.value }))}
                />
                {errors["price"] ? <p className="text-xs text-destructive">{errors["price"]}</p> : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-category">Category</Label>
                <select
                  id="p-category"
                  className={selectCls}
                  value={draft.category}
                  onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))}
                >
                  {categories
                    .filter((c) => c !== "All")
                    .map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-length">Length</Label>
                <select
                  id="p-length"
                  className={selectCls}
                  value={draft.length}
                  onChange={(e) => setDraft((d) => ({ ...d, length: e.target.value }))}
                >
                  {lengths.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="p-texture">Texture</Label>
                <select
                  id="p-texture"
                  className={selectCls}
                  value={draft.texture}
                  onChange={(e) => setDraft((d) => ({ ...d, texture: e.target.value }))}
                >
                  {textures.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="p-upload">Upload your own photo (JPG, PNG or WEBP, up to 5 MB)</Label>
              <Input
                id="p-upload"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                aria-invalid={Boolean(errors["file"])}
                onChange={(e) => setDraft((d) => ({ ...d, file: e.target.files?.[0] ?? null }))}
              />
              {draft.file ? (
                <img
                  src={URL.createObjectURL(draft.file)}
                  alt="Preview of the selected photo"
                  className="size-24 rounded-sm object-cover"
                />
              ) : draft.imageUrl && editing && photos[editing.id] ? (
                <div className="flex items-center gap-3">
                  <img src={photos[editing.id]} alt="Current product photo" className="size-24 rounded-sm object-cover" />
                  <Button type="button" variant="outline" size="sm" onClick={() => setDraft((d) => ({ ...d, imageUrl: null }))}>
                    Use a studio photo instead
                  </Button>
                </div>
              ) : null}
              {errors["file"] ? <p className="text-xs text-destructive">{errors["file"]}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="p-image">Studio photo (used when no photo is uploaded)</Label>
              <select
                id="p-image"
                className={selectCls}
                value={draft.imageKey}
                onChange={(e) => setDraft((d) => ({ ...d, imageKey: e.target.value }))}
              >
                {imageKeys.map((k, i) => (
                  <option key={k} value={k}>
                    Studio photo {i + 1}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="p-desc">Description</Label>
              <Textarea
                id="p-desc"
                rows={3}
                value={draft.description}
                aria-invalid={Boolean(errors["description"])}
                onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
              />
              {errors["description"] ? (
                <p className="text-xs text-destructive">{errors["description"]}</p>
              ) : null}
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={draft.inStock}
                onChange={(e) => setDraft((d) => ({ ...d, inStock: e.target.checked }))}
                className="size-4 accent-[var(--primary)]"
              />
              Available in stock
            </label>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : editing ? "Save changes" : "Add product"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
