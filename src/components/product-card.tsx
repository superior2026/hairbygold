import { Link } from "@tanstack/react-router";
import { Heart, Star } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { toast } from "sonner";
import type { Product } from "@/lib/mock-data";
import { currency, useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  const { isWishlisted, toggleWishlist } = useStore();
  const saved = isWishlisted(product.id);
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="group relative"
      whileHover={reduceMotion ? { y: 0 } : { y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
    >
      <Link
        to="/product/$productId"
        params={{ productId: product.id }}
        className="block overflow-hidden rounded-sm bg-secondary"
      >
        <div className="relative aspect-[4/5] overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            width={1024}
            height={1024}
            className="size-full object-cover transition-transform duration-700 group-hover:scale-105 group-focus-within:scale-105 motion-reduce:transform-none motion-reduce:transition-none"
          />
          {product.badge ? (
            <span className="absolute left-3 top-3 rounded-sm bg-background/90 px-2.5 py-1 text-[0.62rem] tracking-luxe text-foreground">
              {product.badge}
            </span>
          ) : null}
          {product.inStock === false ? (
            <span className="absolute inset-x-0 bottom-0 bg-ink/70 py-2 text-center text-[0.62rem] tracking-luxe text-background">
              Sold out
            </span>
          ) : null}
        </div>
      </Link>

      <button
        type="button"
        aria-label={saved ? "Remove from wishlist" : "Add to wishlist"}
        onClick={() => {
          toggleWishlist(product.id);
          toast.success(saved ? "Removed from wishlist" : "Saved to wishlist");
        }}
        className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-background/85 text-foreground shadow-soft transition hover:bg-background"
      >
        <Heart className={cn("size-4", saved && "fill-primary text-primary")} />
      </button>

      <div className="mt-4 space-y-1.5">
        <p className="text-[0.62rem] tracking-luxe text-muted-foreground">{product.category}</p>
        <Link
          to="/product/$productId"
          params={{ productId: product.id }}
          className="block font-display text-xl leading-tight hover:text-primary"
        >
          {product.name}
        </Link>
        <div className="flex items-center justify-between pt-1">
          <span className="text-sm font-medium">{currency(product.price)}</span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="size-3 fill-gold text-gold" />
            {product.rating} ({product.reviews})
          </span>
        </div>
      </div>
    </motion.div>
  );
}
