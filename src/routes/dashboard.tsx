import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useFakeLoading } from "@/hooks/use-fake-loading";
import {
  categories,
  conversations,
  lengths,
  messagesByConversation,
  products as seedProducts,
  textures,
  type Product,
} from "@/lib/mock-data";
import { currency } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Owner Dashboard — Hair by Gold" },
      {
        name: "description",
        content:
          "Manage the Hair by Gold catalogue and read incoming customer messages from one elegant owner dashboard.",
      },
      { property: "og:title", content: "Owner Dashboard — Hair by Gold" },
      {
        property: "og:description",
        content: "Add, edit and remove products and review customer enquiries.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Dashboard;
});

type Draft = {
  name: string;
  price: string;
  category: string;
  length: string;
  texture: string;
  description: string;
  inStock: boolean;
};

const emptyDraft: Draft = {
  name: "",
  price: "",
  category: "Lace Front Wigs",
  length: '20"',
  texture: "Straight",
  description: "",
  inStock: true,
};

const selectCls =
  "h-11 w-full rounded-sm border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50";

function Dashboard() {
  const loading = useFakeLoading(700);
  const [items, setItems] = useState<Product[]>(seedProducts);
  const [editing, setEditing] = useState<Product | null>(null);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [flash, setFlash] = useState("");
  const [readIds, setReadIds] = useState<string[]>([]);
  const [activeThread, setActiveThread] = useState<string | null>(null);

  const stats = useMemo(
    () => ({
      total: items.length,
      inStock: items.filter((p) => p.inStock).length,
      value: items.reduce((n, p) => n + p.price, 0),
      unread: conversations.filter((c) => c.unread > 0 && !readIds.includes(c.id)).length,
    }),
    [items, readIds],
  );

  const startCreate = () => {
    setEditing(null);
    setDraft(emptyDraft);
    setErrors({});
    setOpen(true);
  };

  const startEdit = (p: Product) => {
    setEditing(p);
    setDraft({
      name: p.name,
      price: String(p.price),
      category: p.category,
      length: p.length,
      texture: p.texture,
      description: p.description,
      inStock: Boolean(p.inStock),
    });
    setErrors({});
    setOpen(true);
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (draft.name.trim().length < 3) next['name'] = "Give the product a name of at least 3 characters.";
    const price = Number(draft.price);
    if (!draft.price.trim() || Number.isNaN(price) || price <= 0) next['price'] = "Enter a price greater than 0.";
    if (draft.description.trim().length < 10) next['description'] = "Add a short description (10+ characters).";
    setErrors(next);
    if (Object.keys(next).length) return;

    if (editing) {
      setItems((prev) =>
        prev.map((p) =>
          p.id === editing.id
            ? {
                ...p,
                name: draft.name.trim(),
                price,
                category: draft.category,
                length: draft.length,
                texture: draft.texture,
                description: draft.description.trim(),
                inStock: draft.inStock,
              }
            : p,
        ),
      );
      setFlash(`Saved changes to “${draft.name.trim()}”.`);
    } else {
      const created: Product = {
        id: `hbg-new-${Date.now()}`,
        name: draft.name.trim(),
        price,
        category: draft.category,
        length: draft.length,
        texture: draft.texture,
        rating: 5,
        reviews: 0,
        image: seedProducts[0]!.image,
        badge: "New",
        description: draft.description.trim(),
        inStock: draft.inStock,
      };
      setItems((prev) => [created, ...prev]);
      setFlash(`Added “${created.name}” to the catalogue.`);
    }
    setOpen(false);
  };

  const remove = (p: Product) => {
    setItems((prev) => prev.filter((x) => x.id !== p.id));
    setFlash(`Removed “${p.name}”.`);
  };

  const thread = activeThread ? (messagesByConversation[activeThread] ?? []) : [];

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
      <header>
        <p className="text-[0.62rem] tracking-luxe text-primary">Owner area</p>
        <h1 className="mt-4 font-display text-5xl">Dashboard</h1>
        <p className="mt-3 max-w-xl text-sm text-muted-foreground">
          Manage your catalogue and read customer enquiries. Changes live in this browser session only — nothing is
          published or shared yet.
        </p>
      </header>

      <dl className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Products", value: String(stats.total) },
          { label: "In stock", value: String(stats.inStock) },
          { label: "Catalogue value", value: currency(stats.value) },
          { label: "Unread messages", value: String(stats.unread) },
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
                              src={p.image}
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
                        <td className="p-4">{currency(p.price)}</td>
                        <td className="p-4">
                          <span
                            className={cn(
                              "rounded-full px-2 py-1 text-[0.65rem]",
                              p.inStock ? "bg-success/15 text-success" : "bg-muted text-muted-foreground",
                            )}
                          >
                            {p.inStock ? "In stock" : "Sold out"}
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
                              onClick={() => remove(p)}
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
              {loading
                ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)
                : conversations.map((c) => {
                    const unread = c.unread > 0 && !readIds.includes(c.id);
                    return (
                      <li key={c.id}>
                        <button
                          type="button"
                          aria-current={activeThread === c.id}
                          onClick={() => {
                            setActiveThread(c.id);
                            setReadIds((prev) => (prev.includes(c.id) ? prev : [...prev, c.id]));
                          }}
                          className={cn(
                            "w-full rounded-sm border p-4 text-left transition focus-visible:ring-2 focus-visible:ring-ring/50",
                            activeThread === c.id
                              ? "border-primary bg-secondary"
                              : "border-border bg-card hover:bg-secondary/60",
                          )}
                        >
                          <span className="flex items-center gap-2">
                            <span className="text-sm font-medium">{c.name}</span>
                            {unread ? (
                              <span className="rounded-full bg-primary px-2 py-0.5 text-[0.6rem] text-primary-foreground">
                                New
                              </span>
                            ) : null}
                            <span className="ml-auto text-[0.65rem] text-muted-foreground">{c.time}</span>
                          </span>
                          <span className="mt-1 block text-xs text-muted-foreground">{c.preview}</span>
                        </button>
                      </li>
                    );
                  })}
            </ul>

            <div className="rounded-sm border border-border bg-card p-6">
              {activeThread ? (
                <ul className="space-y-4">
                  {thread.map((m) => (
                    <li key={m.id} className={cn("flex", m.from === "me" && "justify-end")}>
                      <div
                        className={cn(
                          "max-w-[80%] rounded-2xl px-4 py-3 text-sm",
                          m.from === "me"
                            ? "rounded-br-sm bg-primary text-primary-foreground"
                            : "rounded-bl-sm bg-secondary text-secondary-foreground",
                        )}
                      >
                        <p>{m.text}</p>
                        <p className="mt-1.5 text-[0.65rem] opacity-75">{m.time}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Select a conversation to read the full message thread.
                </p>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit product" : "Add product"}</DialogTitle>
            <DialogDescription>
              Details are saved in this browser only until cloud storage is enabled.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={save} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="p-name">Product name</Label>
              <Input
                id="p-name"
                value={draft.name}
                aria-invalid={Boolean(errors['name'])}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              />
              {errors['name'] ? <p className="text-xs text-destructive">{errors['name']}</p> : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="p-price">Price (USD)</Label>
                <Input
                  id="p-price"
                  inputMode="decimal"
                  value={draft.price}
                  aria-invalid={Boolean(errors['price'])}
                  onChange={(e) => setDraft((d) => ({ ...d, price: e.target.value }))}
                />
                {errors['price'] ? <p className="text-xs text-destructive">{errors['price']}</p> : null}
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
              <Label htmlFor="p-desc">Description</Label>
              <Textarea
                id="p-desc"
                rows={3}
                value={draft.description}
                aria-invalid={Boolean(errors['description'])}
                onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
              />
              {errors['description'] ? (
                <p className="text-xs text-destructive">{errors['description']}</p>
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
              <Button type="submit">{editing ? "Save changes" : "Add product"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
