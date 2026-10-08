import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { catalogQuery } from "@/lib/catalog";
import { categories, lengths, textures } from "@/lib/mock-data";
import { getOwnerStatus, saveProduct } from "@/lib/owner.functions";
import { uploadStudioPhoto, validatePhoto } from "@/lib/photo-upload";
import { currency } from "@/lib/store";

export const Route = createFileRoute("/catalog")({
  loader: ({ context }) => context.queryClient.ensureQueryData(catalogQuery),
  head: () => ({
    meta: [
      { title: "The Catalogue — Hair by Gold" },
      {
        name: "description",
        content:
          "The full Hair by Gold catalogue: wigs, bundles, hair care and accessories with photos, details and availability.",
      },
      { property: "og:title", content: "The Catalogue — Hair by Gold" },
      {
        property: "og:description",
        content: "Every Hair by Gold piece with photos, descriptions and availability.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Catalog,
});

const selectCls =
  "mt-2 h-11 w-full rounded-sm border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50";

const empty = {
  name: "",
  price: "",
  category: "Lace Front Wigs",
  length: '20"',
  texture: "Straight",
  description: "",
  inStock: true,
};

function Catalog() {
  const { data: products } = useSuspenseQuery(catalogQuery);
  const queryClient = useQueryClient();
  const ownerStatus = useServerFn(getOwnerStatus);
  const persist = useServerFn(saveProduct);
  const [isOwner, setIsOwner] = useState(false);
  const [form, setForm] = useState(empty);
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState("");

  useEffect(() => {
    void supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) return;
      try {
        setIsOwner((await ownerStatus()).isOwner);
      } catch {
        setIsOwner(false);
      }
    });
  }, [ownerStatus]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (form.name.trim().length < 3) next["name"] = "Give the product a name of at least 3 characters.";
    const price = Number(form.price);
    if (!form.price.trim() || Number.isNaN(price) || price <= 0) next["price"] = "Enter a price greater than 0.";
    if (form.description.trim().length < 10) next["description"] = "Add a description (10+ characters).";
    if (!file) next["file"] = "Choose a product photo.";
    else {
      const problem = validatePhoto(file);
      if (problem) next["file"] = problem;
    }
    setErrors(next);
    if (Object.keys(next).length || !file) return;

    setBusy(true);
    setFlash("");
    try {
      const path = await uploadStudioPhoto(file, "products");
      await persist({
        data: {
          name: form.name.trim(),
          price,
          category: form.category,
          length: form.length,
          texture: form.texture,
          description: form.description.trim(),
          in_stock: form.inStock,
          image_key: "product-1",
          image_url: path,
        },
      });
      await queryClient.invalidateQueries({ queryKey: ["catalog"] });
      setFlash(`Added “${form.name.trim()}” to the catalogue.`);
      setForm(empty);
      setFile(null);
    } catch (err) {
      setErrors({ form: (err as Error).message || "Couldn't save — please try again." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-20">
      <header className="max-w-2xl">
        <p className="text-[0.62rem] tracking-luxe text-primary">The collection</p>
        <h1 className="mt-5 font-display text-4xl leading-tight sm:text-5xl">
          The Hair by Gold <span className="text-gradient-gold">catalogue</span>
        </h1>
        <p className="mt-5 text-base leading-relaxed text-muted-foreground">
          Every piece we stock, with the details you need to choose.
        </p>
      </header>

      {isOwner ? (
        <section aria-labelledby="add-heading" className="mt-10 rounded-sm border border-primary/40 bg-card p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 id="add-heading" className="font-display text-2xl">
              Add a product
            </h2>
            <Link to="/dashboard" className="text-sm text-primary hover:underline">
              Edit or remove products in the dashboard
            </Link>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Only you can see this panel.</p>
          <form onSubmit={submit} noValidate className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="cg-name">Product name</Label>
              <Input id="cg-name" className="mt-2" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              {errors["name"] ? <p className="mt-1 text-xs text-destructive">{errors["name"]}</p> : null}
            </div>
            <div>
              <Label htmlFor="cg-price">Price (USD)</Label>
              <Input id="cg-price" inputMode="decimal" className="mt-2" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} />
              {errors["price"] ? <p className="mt-1 text-xs text-destructive">{errors["price"]}</p> : null}
            </div>
            <div>
              <Label htmlFor="cg-cat">Category</Label>
              <select id="cg-cat" className={selectCls} value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
                {categories.filter((c) => c !== "All").map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cg-len">Length</Label>
                <select id="cg-len" className={selectCls} value={form.length} onChange={(e) => setForm((f) => ({ ...f, length: e.target.value }))}>
                  {["—", ...lengths].map((l) => (
                    <option key={l}>{l}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="cg-tex">Texture</Label>
                <select id="cg-tex" className={selectCls} value={form.texture} onChange={(e) => setForm((f) => ({ ...f, texture: e.target.value }))}>
                  {["—", ...textures].map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="cg-desc">Description</Label>
              <Textarea id="cg-desc" rows={3} className="mt-2" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
              {errors["description"] ? <p className="mt-1 text-xs text-destructive">{errors["description"]}</p> : null}
            </div>
            <div>
              <Label htmlFor="cg-photo">Product photo (JPG, PNG or WEBP, up to 5 MB)</Label>
              <Input id="cg-photo" type="file" accept="image/jpeg,image/png,image/webp" className="mt-2" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
              {errors["file"] ? <p className="mt-1 text-xs text-destructive">{errors["file"]}</p> : null}
              {file ? <img src={URL.createObjectURL(file)} alt="Preview of the selected photo" className="mt-3 size-24 rounded-sm object-cover" /> : null}
            </div>
            <label className="flex items-center gap-2 self-center text-sm">
              <input type="checkbox" checked={form.inStock} onChange={(e) => setForm((f) => ({ ...f, inStock: e.target.checked }))} className="size-4 accent-[var(--primary)]" />
              Available in stock
            </label>
            {errors["form"] ? <p role="alert" className="text-sm text-destructive sm:col-span-2">{errors["form"]}</p> : null}
            {flash ? <p role="status" className="text-sm text-primary sm:col-span-2">{flash}</p> : null}
            <div className="sm:col-span-2">
              <Button type="submit" disabled={busy}>{busy ? "Saving…" : "Add to catalogue"}</Button>
            </div>
          </form>
        </section>
      ) : null}

      <ul className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <li key={p.id} className="flex flex-col overflow-hidden rounded-sm border border-border bg-card shadow-soft">
            <Link to="/product/$productId" params={{ productId: p.id }} className="block aspect-[4/5] overflow-hidden bg-secondary">
              <img src={p.image} alt={p.name} loading="lazy" className="size-full object-cover transition-transform duration-700 hover:scale-105" />
            </Link>
            <div className="flex flex-1 flex-col p-6">
              <p className="text-[0.62rem] tracking-luxe text-primary">{p.category}</p>
              <h2 className="mt-2 font-display text-2xl">{p.name}</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {p.texture} · {p.length}
              </p>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{p.description}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="font-display text-xl">{currency(p.price)}</span>
                <span className={p.inStock === false ? "text-xs text-muted-foreground" : "text-xs text-success"}>
                  {p.inStock === false ? "Sold out" : "In stock"}
                </span>
              </div>
            </div>
          </li>
        ))}
        {products.length === 0 ? (
          <li className="text-sm text-muted-foreground">The catalogue is being updated — check back soon.</li>
        ) : null}
      </ul>
    </div>
  );
}
