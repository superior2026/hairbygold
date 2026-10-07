import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { recommendForCustomer, type AdvisorResult } from "@/lib/advisor.functions";

export const Route = createFileRoute("/style-advisor")({
  head: () => ({
    meta: [
      { title: "AI Style Advisor — Hair by Gold" },
      {
        name: "description",
        content:
          "Tell us your hair goals, hair type and occasion and get AI-powered service and wig picks from the Hair by Gold catalogue.",
      },
      { property: "og:title", content: "AI Style Advisor — Hair by Gold" },
      {
        property: "og:description",
        content: "Personal service and product recommendations for your hair goals.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StyleAdvisor,
});

const hairTypes = ["Straight", "Wavy", "Curly", "Coily / Kinky", "Relaxed", "Locs", "Not sure"];

const schema = z.object({
  goals: z.string().trim().min(5, "Tell us a little more about your goals").max(800),
  hairType: z.string().min(1, "Choose your hair type"),
  occasion: z.string().trim().min(1, "Add an occasion — even “everyday” works").max(120),
});

function StyleAdvisor() {
  const recommend = useServerFn(recommendForCustomer);
  const [values, setValues] = useState({ goals: "", hairType: "", occasion: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<AdvisorResult | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const i of parsed.error.issues) next[String(i.path[0])] ??= i.message;
      setErrors(next);
      return;
    }
    setErrors({});
    setBusy(true);
    setResult(null);
    try {
      setResult(await recommend({ data: parsed.data }));
    } catch {
      setResult({ ok: false, error: "Something went wrong. Please try again shortly." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-14 lg:px-8 lg:py-20">
      <header className="max-w-2xl">
        <p className="inline-flex items-center gap-2 text-[0.62rem] tracking-luxe text-primary">
          <Sparkles className="size-3.5" aria-hidden="true" /> AI-powered
        </p>
        <h1 className="mt-5 font-display text-4xl leading-tight sm:text-5xl">
          Your personal <span className="text-gradient-gold">style advisor</span>
        </h1>
        <p className="mt-5 text-base leading-relaxed text-muted-foreground">
          Describe the look you want and we&apos;ll suggest services and pieces from our studio.
        </p>
      </header>

      <form onSubmit={submit} noValidate className="mt-10 grid gap-5 rounded-sm border border-border bg-card p-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="sa-goals">Your hair goals</Label>
          <Textarea
            id="sa-goals"
            rows={3}
            className="mt-2"
            placeholder="e.g. A natural-looking long wig I can wear daily without glue"
            value={values.goals}
            aria-invalid={Boolean(errors["goals"])}
            onChange={(e) => setValues((v) => ({ ...v, goals: e.target.value }))}
          />
          {errors["goals"] ? <p className="mt-1 text-xs text-destructive">{errors["goals"]}</p> : null}
        </div>
        <div>
          <Label htmlFor="sa-type">Hair type</Label>
          <select
            id="sa-type"
            className="mt-2 h-11 w-full rounded-sm border border-border bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            value={values.hairType}
            aria-invalid={Boolean(errors["hairType"])}
            onChange={(e) => setValues((v) => ({ ...v, hairType: e.target.value }))}
          >
            <option value="">Choose one</option>
            {hairTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          {errors["hairType"] ? <p className="mt-1 text-xs text-destructive">{errors["hairType"]}</p> : null}
        </div>
        <div>
          <Label htmlFor="sa-occasion">Occasion</Label>
          <Input
            id="sa-occasion"
            className="mt-2"
            placeholder="Wedding, birthday, everyday…"
            value={values.occasion}
            aria-invalid={Boolean(errors["occasion"])}
            onChange={(e) => setValues((v) => ({ ...v, occasion: e.target.value }))}
          />
          {errors["occasion"] ? <p className="mt-1 text-xs text-destructive">{errors["occasion"]}</p> : null}
        </div>
        <div className="sm:col-span-2">
          <Button type="submit" disabled={busy}>
            {busy ? "Finding your look…" : "Get recommendations"}
          </Button>
        </div>
      </form>

      <section aria-live="polite" aria-busy={busy} className="mt-12">
        {busy ? (
          <div className="space-y-4">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-24 w-full" />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[4/5] w-full" />
              ))}
            </div>
          </div>
        ) : result && !result.ok ? (
          <p role="alert" className="rounded-sm border border-destructive/40 bg-card p-5 text-sm text-destructive">
            {result.error}
          </p>
        ) : result && result.ok ? (
          <div>
            <h2 className="font-display text-3xl">Your recommendations</h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">{result.summary}</p>

            {result.services.length ? (
              <>
                <h3 className="mt-10 text-[0.62rem] tracking-luxe text-primary">Services</h3>
                <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {result.services.map((s) => (
                    <li key={s.name} className="rounded-sm border border-border bg-card p-5">
                      <p className="font-display text-xl">{s.name}</p>
                      <p className="mt-2 text-sm text-muted-foreground">{s.reason}</p>
                      <Link to="/services" className="mt-4 inline-block text-sm text-primary hover:underline">
                        Book this service
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}

            {result.products.length ? (
              <>
                <h3 className="mt-10 text-[0.62rem] tracking-luxe text-primary">Products</h3>
                <ul className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {result.products.map(({ product, reason }) => (
                    <li key={product.id}>
                      <ProductCard product={product} />
                      <p className="mt-2 text-xs text-muted-foreground">{reason}</p>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}

            {result.careTip ? (
              <p className="mt-10 rounded-sm border border-primary/40 bg-primary/5 p-5 text-sm">
                <span className="font-medium">Care tip: </span>
                {result.careTip}
              </p>
            ) : null}
          </div>
        ) : null}
      </section>
    </div>
  );
}
