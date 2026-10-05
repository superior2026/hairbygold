import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Scissors, Sparkles, Truck } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { ProductGridSkeleton } from "@/components/skeletons";
import { useFakeLoading } from "@/hooks/use-fake-loading";
import { useCatalog } from "@/lib/catalog";
import { heroImage, testimonials } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Hair by Gold — Luxury Wigs, Bundles & Hair Care" },
      {
        name: "description",
        content:
          "Shop HD lace front wigs, closure units, virgin bundles and after-care rituals from Hair by Gold, with concierge styling support.",
      },
      { property: "og:title", content: "Hair by Gold — Luxury Wigs, Bundles & Hair Care" },
      {
        property: "og:description",
        content: "HD lace wigs, virgin bundles and after-care rituals with concierge styling support.",
      },
    ],
  }),
  component: Home,
});

const pillars = [
  {
    Icon: Sparkles,
    title: "Single-donor hair",
    text: "Cuticle-aligned, ethically sourced and colour-matched by hand in our studio.",
  },
  {
    Icon: Scissors,
    title: "Custom finishing",
    text: "Plucked hairlines, bleached knots and a free first cut with every unit.",
  },
  {
    Icon: Truck,
    title: "Worldwide dispatch",
    text: "Tracked delivery in 2–7 days with insured packaging and easy returns.",
  },
];

function Home() {
  const loading = useFakeLoading(1100);
  const featured = useCatalog().slice(0, 4);

  return (
    <div>
      <section className="relative overflow-hidden border-b border-border">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-16 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-24">
          <div>
            <p className="text-[0.62rem] tracking-luxe text-primary">Est. Lagos · Ships worldwide</p>
            <h1 className="mt-6 font-display text-5xl leading-[1.05] sm:text-6xl lg:text-7xl">
              Hair that carries
              <span className="block text-gradient-gold">its own light.</span>
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
              HD lace units, double-drawn bundles and after-care rituals — finished by hand, styled
              with you over chat, delivered ready to wear.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                to="/explore"
                className="inline-flex h-12 items-center gap-2 rounded-sm bg-primary px-6 text-sm text-primary-foreground transition hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                Shop the collection
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link
                to="/chat"
                className="inline-flex h-12 items-center rounded-sm border border-input px-6 text-sm transition hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                Talk to a stylist
              </Link>
            </div>
            <dl className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-border pt-8">
              {[
                ["12k+", "Units styled"],
                ["4.9", "Average rating"],
                ["48h", "Studio finishing"],
              ].map(([v, l]) => (
                <div key={l}>
                  <dt className="sr-only">{l}</dt>
                  <dd>
                    <span className="block font-display text-3xl">{v}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">{l}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 -z-10 surface-gold rounded-sm" aria-hidden="true" />
            <img
              src={heroImage}
              alt="Model wearing a glossy body-wave wig from the Hair by Gold collection"
              width={1536}
              height={1024}
              className="aspect-[4/5] w-full rounded-sm object-cover shadow-lift"
            />
          </div>
        </div>
      </section>

      <section aria-labelledby="pillars" className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <h2 id="pillars" className="sr-only">
          Why Hair by Gold
        </h2>
        <ul className="grid gap-8 md:grid-cols-3">
          {pillars.map(({ Icon, title, text }) => (
            <li key={title} className="rounded-sm border border-border bg-card p-7 shadow-soft">
              <Icon className="size-5 text-primary" aria-hidden="true" />
              <h3 className="mt-5 font-display text-2xl">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="featured" className="mx-auto max-w-7xl px-5 pb-8 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[0.62rem] tracking-luxe text-muted-foreground">The edit</p>
            <h2 id="featured" className="mt-3 font-display text-4xl">
              Signature pieces
            </h2>
          </div>
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 rounded-sm text-sm text-primary hover:underline focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            View all products
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-10" aria-busy={loading}>
          {loading ? (
            <ProductGridSkeleton count={4} />
          ) : (
            <div className="grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
              {featured.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section aria-labelledby="salon" className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2">
          <Link
            to="/services"
            className="group rounded-sm border border-border bg-card p-8 transition hover:border-primary/60 hover:shadow-lift focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <h2 id="salon" className="font-display text-3xl">
              Salon services
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Installations, revamps, bridal and birthday hair, ponytails, natural hair styling and
              home service. Contact us for current pricing.
            </p>
            <span className="mt-5 inline-flex items-center gap-2 text-sm text-primary">
              Book an appointment
              <ArrowRight className="size-4 transition group-hover:translate-x-1" aria-hidden="true" />
            </span>
          </Link>
          <Link
            to="/gallery"
            className="group rounded-sm border border-border bg-card p-8 transition hover:border-primary/60 hover:shadow-lift focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <h2 className="font-display text-3xl">Featured hairstyles</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Browse the studio gallery by installations, bridal, wig styling, ponytails, natural
              hair and special occasions.
            </p>
            <span className="mt-5 inline-flex items-center gap-2 text-sm text-primary">
              View the gallery
              <ArrowRight className="size-4 transition group-hover:translate-x-1" aria-hidden="true" />
            </span>
          </Link>
        </div>
      </section>

      <section aria-labelledby="loved" className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <h2 id="loved" className="text-center font-display text-4xl">
          Loved by the studio chair
        </h2>
        <div className="mx-auto mt-4 h-px w-24 gold-rule" aria-hidden="true" />
        <ul className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <li key={t.name} className="rounded-sm border border-border bg-card p-7">
              <p className="font-display text-xl leading-relaxed">“{t.text}”</p>
              <p className="mt-5 text-[0.62rem] tracking-luxe text-muted-foreground">{t.name}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
