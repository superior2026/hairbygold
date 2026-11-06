import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { FadeInOnMount } from "@/components/motion-primitives";
import { useFakeLoading } from "@/hooks/use-fake-loading";
import {
  galleryCategories,
  galleryItems,
  type GalleryCategory,
} from "@/lib/salon-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Featured Hairstyles Gallery — Hair by Gold" },
      {
        name: "description",
        content:
          "Browse Hair by Gold studio work: installations, bridal hair, wig styling, ponytails, natural hair and special occasion looks.",
      },
      { property: "og:title", content: "Featured Hairstyles Gallery — Hair by Gold" },
      {
        property: "og:description",
        content:
          "Installations, bridal, wig styling, ponytails, natural hair and special occasion looks from the studio chair.",
      },
    ],
  }),
  component: Gallery,
});

function Gallery() {
  const [active, setActive] = useState<GalleryCategory>("All");
  const loading = useFakeLoading(800, [active]);
  const items = active === "All" ? galleryItems : galleryItems.filter((i) => i.category === active);

  return (
    <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-20">
      <FadeInOnMount>
        <header className="max-w-2xl">
        <p className="text-[0.62rem] tracking-luxe text-primary">The gallery</p>
        <h1 className="mt-5 font-display text-4xl leading-tight sm:text-5xl">
          Featured <span className="text-gradient-gold">hairstyles</span>
        </h1>
        <p className="mt-5 text-base leading-relaxed text-muted-foreground">
          A look at work finished in the Hair by Gold chair — installs, bridal mornings, revamps
          and celebration hair.
        </p>
        <Link
          to="/services"
          className="mt-6 inline-flex h-11 items-center rounded-sm bg-primary px-5 text-sm text-primary-foreground transition hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          Book a service
        </Link>
      </header>
      </FadeInOnMount>

      <div
        role="group"
        aria-label="Filter gallery by category"
        className="mt-12 flex flex-wrap gap-2"
      >
        {galleryCategories.map((c) => (
          <button
            key={c}
            type="button"
            aria-pressed={active === c}
            onClick={() => setActive(c)}
            className={cn(
              "rounded-sm border px-4 py-2 text-sm transition focus-visible:ring-2 focus-visible:ring-ring/50",
              active === c
                ? "border-primary bg-primary text-primary-foreground"
                : "border-input text-foreground/80 hover:border-primary hover:text-primary",
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <p className="mt-5 text-xs text-muted-foreground" aria-live="polite">
        {loading ? "Loading looks…" : `${items.length} look${items.length === 1 ? "" : "s"} shown`}
      </p>

      <div className="mt-6" aria-busy={loading}>
        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[4/5] w-full rounded-sm" />
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
            {items.map((item) => (
              <li key={item.id}>
                <figure className="group relative overflow-hidden rounded-sm border border-border bg-secondary">
                  <div className="aspect-[4/5] overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.alt}
                      loading="lazy"
                      width={896}
                      height={1120}
                      className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/85 to-transparent p-4">
                    <span className="text-[0.62rem] tracking-luxe text-primary">
                      {item.category}
                    </span>
                    <span className="mt-1 block font-display text-lg text-background">
                      {item.title}
                    </span>
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
