import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { ProductGridSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/button";
import { useFakeLoading } from "@/hooks/use-fake-loading";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/wishlist")({
  head: () => ({
    meta: [
      { title: "Your Wishlist — Hair by Gold" },
      {
        name: "description",
        content: "Saved wigs, bundles and hair care you're considering at Hair by Gold.",
      },
      { property: "og:title", content: "Your Wishlist — Hair by Gold" },
      { property: "og:description", content: "Everything you've saved for later at Hair by Gold." },
    ],
  }),
  component: Wishlist,
});

function Wishlist() {
  const { wishlistProducts } = useStore();
  const loading = useFakeLoading(700);

  return (
    <div className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
      <header>
        <p className="text-[0.62rem] tracking-luxe text-primary">Saved for later</p>
        <h1 className="mt-4 font-display text-5xl">Wishlist</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {wishlistProducts.length} piece{wishlistProducts.length === 1 ? "" : "s"} you're keeping an
          eye on.
        </p>
      </header>

      <div className="mt-12" aria-busy={loading}>
        {loading ? (
          <ProductGridSkeleton count={4} />
        ) : wishlistProducts.length === 0 ? (
          <div className="rounded-sm border border-dashed border-border p-16 text-center">
            <Heart className="mx-auto size-6 text-primary" aria-hidden="true" />
            <h2 className="mt-5 font-display text-3xl">Nothing saved yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Tap the heart on any product to keep it here.
            </p>
            <Button asChild className="mt-7">
              <Link to="/explore">Explore the collection</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
            {wishlistProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
