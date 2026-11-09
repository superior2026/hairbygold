import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { z } from "zod";
import { ProductCard } from "@/components/product-card";
import { ProductSearch } from "@/components/product-search";
import { ProductGridSkeleton } from "@/components/skeletons";
import { FadeInOnMount, Stagger, StaggerItem } from "@/components/motion-primitives";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useFakeLoading } from "@/hooks/use-fake-loading";
import { catalogQuery } from "@/lib/catalog";
import { categories, textures } from "@/lib/mock-data";
import { currency } from "@/lib/store";
import { cn } from "@/lib/utils";

const searchSchema = z.object({ q: z.string().optional() });

export const Route = createFileRoute("/explore")({
  validateSearch: searchSchema,
  loader: ({ context }) => context.queryClient.ensureQueryData(catalogQuery),
  head: () => ({
    meta: [
      { title: "Explore Wigs & Hair Products — Hair by Gold" },
      {
        name: "description",
        content:
          "Browse HD lace front wigs, closure units, virgin bundles, hair care and accessories. Filter by price, hair type, style and availability.",
      },
      { property: "og:title", content: "Explore Wigs & Hair Products — Hair by Gold" },
      {
        property: "og:description",
        content: "Filter premium wigs and bundles by price, hair type, style and availability.",
      },
    ],
  }),
  component: Explore,
});

type Sort = "featured" | "price-asc" | "price-desc" | "rating" | "newest";

const sortLabels: Record<Sort, string> = {
  featured: "Featured",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  rating: "Top rated",
  newest: "Newest",
};

function Explore() {
  const { q } = Route.useSearch();
  const { data: products } = useSuspenseQuery(catalogQuery);
  const [query, setQuery] = useState(q ?? "");
  const [category, setCategory] = useState<string>("All");
  const [sort, setSort] = useState<Sort>("featured");
  const [price, setPrice] = useState<[number, number]>([20, 500]);
  const [hairTypes, setHairTypes] = useState<string[]>([]);
  const [availability, setAvailability] = useState("all");
  const [panelOpen, setPanelOpen] = useState(false);

  const filterKey = JSON.stringify({ query, category, sort, price, hairTypes, availability });
  const loading = useFakeLoading(700, [filterKey]);

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    let list = products.filter((p) => {
      if (category !== "All" && p.category !== category) return false;
      if (p.price < price[0] || p.price > price[1]) return false;
      if (hairTypes.length && !hairTypes.includes(p.texture)) return false;
      if (availability === "in" && p.inStock === false) return false;
      if (availability === "out" && p.inStock !== false) return false;
      if (term && !`${p.name} ${p.category} ${p.texture}`.toLowerCase().includes(term)) return false;
      return true;
    });

    list = [...list];
    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    if (sort === "rating") list.sort((a, b) => b.rating - a.rating);
    if (sort === "newest") list.reverse();
    return list;
  }, [products, query, category, price, hairTypes, availability, sort]);

  const toggleType = (t: string) =>
    setHairTypes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  const reset = () => {
    setCategory("All");
    setPrice([20, 500]);
    setHairTypes([]);
    setAvailability("all");
    setSort("featured");
    setQuery("");
  };

  const filters = (
    <div className="space-y-8">
      <fieldset>
        <legend className="text-[0.62rem] tracking-luxe text-muted-foreground">Price range</legend>
        <Slider
          className="mt-5"
          value={price}
          min={20}
          max={500}
          step={5}
          minStepsBetweenThumbs={1}
          onValueChange={(v) => setPrice([v[0] ?? 20, v[1] ?? 500])}
          aria-label="Price range"
        />
        <p className="mt-3 text-sm text-muted-foreground">
          {currency(price[0])} – {currency(price[1])}
        </p>
      </fieldset>

      <fieldset>
        <legend className="text-[0.62rem] tracking-luxe text-muted-foreground">Hair type</legend>
        <div className="mt-4 space-y-3">
          {textures.map((t) => (
            <div key={t} className="flex items-center gap-3">
              <Checkbox
                id={`type-${t}`}
                checked={hairTypes.includes(t)}
                onCheckedChange={() => toggleType(t)}
              />
              <Label htmlFor={`type-${t}`} className="text-sm font-normal">
                {t}
              </Label>
            </div>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-[0.62rem] tracking-luxe text-muted-foreground">Style</legend>
        <div className="mt-4 flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={category === c}
              onClick={() => setCategory(c)}
              className={cn(
                "rounded-sm border px-3 py-2 text-xs transition focus-visible:ring-2 focus-visible:ring-ring/50",
                category === c
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input hover:bg-secondary",
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-[0.62rem] tracking-luxe text-muted-foreground">Availability</legend>
        <RadioGroup value={availability} onValueChange={setAvailability} className="mt-4 space-y-2">
          {[
            ["all", "All products"],
            ["in", "In stock"],
            ["out", "Sold out"],
          ].map(([v, l]) => (
            <div key={v} className="flex items-center gap-3">
              <RadioGroupItem value={v as string} id={`avail-${v}`} />
              <Label htmlFor={`avail-${v}`} className="text-sm font-normal">
                {l}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </fieldset>

      <Button variant="outline" className="w-full" onClick={reset}>
        Reset filters
      </Button>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
      <FadeInOnMount>
        <header>
          <p className="text-[0.62rem] tracking-luxe text-primary">The collection</p>
          <h1 className="mt-4 font-display text-5xl">Explore</h1>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">
            {products.length} pieces in the studio right now — wigs, bundles, care and accessories.
          </p>
        </header>
      </FadeInOnMount>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
        <ProductSearch
          className="sm:max-w-md sm:flex-1"
          value={query}
          onValueChange={setQuery}
          onSubmitQuery={setQuery}
        />
        <div className="flex items-center gap-3 sm:ml-auto">
          <Button
            variant="outline"
            className="lg:hidden"
            aria-expanded={panelOpen}
            onClick={() => setPanelOpen((v) => !v)}
          >
            <SlidersHorizontal className="size-4" aria-hidden="true" />
            Filters
          </Button>
          <div className="flex items-center gap-2">
            <Label htmlFor="sort" className="hidden text-xs text-muted-foreground sm:block">
              Sort
            </Label>
            <Select value={sort} onValueChange={(v) => setSort(v as Sort)}>
              <SelectTrigger id="sort" className="w-[11.5rem]" aria-label="Sort products">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(sortLabels).map(([v, l]) => (
                  <SelectItem key={v} value={v}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[16rem_1fr]">
        <aside
          aria-label="Product filters"
          className={cn("lg:block", panelOpen ? "block" : "hidden")}
        >
          {filters}
        </aside>

        <section aria-label="Products" aria-busy={loading}>
          {loading ? (
            <ProductGridSkeleton count={8} />
          ) : results.length === 0 ? (
            <div className="rounded-sm border border-dashed border-border p-16 text-center">
              <h2 className="font-display text-2xl">Nothing matches those filters</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Try widening the price range or clearing hair types.
              </p>
              <Button className="mt-6" onClick={reset}>
                Reset filters
              </Button>
            </div>
          ) : (
            <>
              <p className="mb-6 text-xs text-muted-foreground" role="status">
                {results.length} result{results.length === 1 ? "" : "s"}
                {query ? ` for “${query}”` : ""}
              </p>
              <Stagger className="grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-3">
                {results.map((p) => (
                  <StaggerItem key={p.id}>
                    <ProductCard product={p} />
                  </StaggerItem>
                ))}
              </Stagger>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
