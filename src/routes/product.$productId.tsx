import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Heart, Minus, Plus, ShieldCheck, Truck } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ProductCard } from "@/components/product-card";
import { ProductReviews } from "@/components/product-reviews";
import { StarRating } from "@/components/star-rating";
import { Button } from "@/components/ui/button";
import { getProduct, products, reviewsFor } from "@/lib/mock-data";
import { currency, useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const colors = [
  { name: "Natural Black", surcharge: 0 },
  { name: "Espresso Brown", surcharge: 15 },
  { name: "Honey Blonde", surcharge: 40 },
  { name: "Burgundy", surcharge: 25 },
];
const lengthOptions = [
  { name: '16"', surcharge: 0 },
  { name: '20"', surcharge: 35 },
  { name: '24"', surcharge: 70 },
  { name: '28"', surcharge: 120 },
];
const capSizes = [
  { name: "Small", surcharge: 0 },
  { name: "Medium", surcharge: 0 },
  { name: "Large", surcharge: 10 },
];

/** Deterministic mock stock matrix so unavailable combinations stay stable. */
function variantAvailable(productId: string, color: string, length: string, size: string) {
  const key = `${productId}${color}${length}${size}`;
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) % 997;
  return hash % 11 !== 0;
}

export const Route = createFileRoute("/product/$productId")({
  loader: ({ params }) => {
    const product = getProduct(params.productId);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Product unavailable — Hair by Gold" }, { name: "robots", content: "noindex" }],
      };
    }
    const { product } = loaderData;
    return {
      meta: [
        { title: `${product.name} — Hair by Gold` },
        { name: "description", content: product.description.slice(0, 155) },
        { property: "og:title", content: `${product.name} — Hair by Gold` },
        { property: "og:description", content: product.description.slice(0, 155) },
      ],
    };
  },
  component: ProductDetail,
});

function ProductDetail() {
  const { product } = Route.useLoaderData();
  const { addToCart, isWishlisted, toggleWishlist } = useStore();
  const [color, setColor] = useState(colors[0]!.name);
  const [length, setLength] = useState(lengthOptions[1]!.name);
  const [size, setSize] = useState(capSizes[1]!.name);
  const [qty, setQty] = useState(1);

  const saved = isWishlisted(product.id);
  const reviews = useMemo(() => reviewsFor(product.id), [product.id]);
  const average = reviews.reduce((n, r) => n + r.rating, 0) / reviews.length;

  const surcharge =
    (colors.find((c) => c.name === color)?.surcharge ?? 0) +
    (lengthOptions.find((l) => l.name === length)?.surcharge ?? 0) +
    (capSizes.find((s) => s.name === size)?.surcharge ?? 0);
  const unitPrice = product.price + surcharge;
  const available = variantAvailable(product.id, color, length, size) && product.inStock !== false;

  const related = products.filter((p) => p.id !== product.id).slice(0, 4);

  const optionBtn = (selected: boolean, disabled: boolean) =>
    cn(
      "rounded-sm border px-4 py-2.5 text-xs transition focus-visible:ring-2 focus-visible:ring-ring/50",
      disabled && "cursor-not-allowed text-muted-foreground/60 line-through opacity-60",
      selected ? "border-primary bg-primary text-primary-foreground" : "border-input hover:bg-secondary",
    );

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
      <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
        <ol className="flex items-center gap-2">
          <li>
            <Link to="/" className="hover:text-primary">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link to="/explore" className="hover:text-primary">
              Explore
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-foreground">
            {product.name}
          </li>
        </ol>
      </nav>

      <div className="mt-8 grid gap-12 lg:grid-cols-2">
        <div>
          <img
            src={product.image}
            alt={product.name}
            width={1024}
            height={1024}
            className="aspect-[4/5] w-full rounded-sm object-cover shadow-soft"
          />
          <div className="mt-4 grid grid-cols-4 gap-3">
            {products.slice(0, 4).map((p) => (
              <img
                key={p.id}
                src={p.image}
                alt=""
                loading="lazy"
                width={1024}
                height={1024}
                className="aspect-square w-full rounded-sm object-cover opacity-80"
              />
            ))}
          </div>
        </div>

        <div>
          <p className="text-[0.62rem] tracking-luxe text-primary">{product.category}</p>
          <h1 className="mt-4 font-display text-5xl leading-tight">{product.name}</h1>
          <div className="mt-4 flex items-center gap-3">
            <StarRating value={average} />
            <span className="text-xs text-muted-foreground">
              {average.toFixed(1)} · {product.reviews} reviews
            </span>
          </div>
          <p className="mt-6 font-display text-4xl">{currency(unitPrice)}</p>
          {surcharge > 0 ? (
            <p className="mt-1 text-xs text-muted-foreground">
              Includes {currency(surcharge)} variant upgrade
            </p>
          ) : null}
          <p className="mt-6 text-sm leading-relaxed text-muted-foreground">{product.description}</p>

          <div className="mt-9 space-y-7">
            <fieldset>
              <legend className="text-[0.62rem] tracking-luxe text-muted-foreground">
                Colour — {color}
              </legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {colors.map((c) => {
                  const disabled = !variantAvailable(product.id, c.name, length, size);
                  return (
                    <button
                      key={c.name}
                      type="button"
                      disabled={disabled}
                      aria-pressed={color === c.name}
                      onClick={() => setColor(c.name)}
                      className={optionBtn(color === c.name, disabled)}
                    >
                      {c.name}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-[0.62rem] tracking-luxe text-muted-foreground">Length</legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {lengthOptions.map((l) => {
                  const disabled = !variantAvailable(product.id, color, l.name, size);
                  return (
                    <button
                      key={l.name}
                      type="button"
                      disabled={disabled}
                      aria-pressed={length === l.name}
                      onClick={() => setLength(l.name)}
                      className={optionBtn(length === l.name, disabled)}
                    >
                      {l.name}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-[0.62rem] tracking-luxe text-muted-foreground">Cap size</legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {capSizes.map((s) => {
                  const disabled = !variantAvailable(product.id, color, length, s.name);
                  return (
                    <button
                      key={s.name}
                      type="button"
                      disabled={disabled}
                      aria-pressed={size === s.name}
                      onClick={() => setSize(s.name)}
                      className={optionBtn(size === s.name, disabled)}
                    >
                      {s.name}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <p
              role="status"
              className={cn("text-xs", available ? "text-success" : "text-destructive")}
            >
              {available
                ? "In stock — ships within 48 hours"
                : "This combination is currently unavailable"}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center rounded-sm border border-input">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="grid size-11 place-items-center text-muted-foreground transition hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  <Minus className="size-4" aria-hidden="true" />
                </button>
                <span className="w-10 text-center text-sm" aria-live="polite">
                  {qty}
                </span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => setQty((q) => Math.min(9, q + 1))}
                  className="grid size-11 place-items-center text-muted-foreground transition hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  <Plus className="size-4" aria-hidden="true" />
                </button>
              </div>

              <Button
                size="lg"
                disabled={!available}
                className="min-h-11 flex-1"
                onClick={() => {
                  for (let i = 0; i < qty; i++) addToCart(product, `${length} · ${color}`);
                  toast.success("Added to bag", { description: `${product.name} · ${length} · ${color}` });
                }}
              >
                Add to bag — {currency(unitPrice * qty)}
              </Button>

              <Button
                size="lg"
                variant="outline"
                aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
                aria-pressed={saved}
                className="min-h-11"
                onClick={() => {
                  toggleWishlist(product.id);
                  toast.success(saved ? "Removed from wishlist" : "Saved to wishlist");
                }}
              >
                <Heart className={cn("size-4", saved && "fill-primary text-primary")} aria-hidden="true" />
              </Button>
            </div>

            <ul className="grid gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:grid-cols-2">
              <li className="flex items-center gap-2">
                <Truck className="size-4 text-primary" aria-hidden="true" />
                Free insured delivery over $300
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
                30-day studio guarantee
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-20">
        <ProductReviews productId={product.id} />
      </div>

      <section aria-labelledby="related" className="mt-20">
        <h2 id="related" className="font-display text-4xl">
          Pairs beautifully with
        </h2>
        <div className="mt-10 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
          {related.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
