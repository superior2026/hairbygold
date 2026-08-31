import { BadgeCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { StarRating } from "@/components/star-rating";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFakeLoading } from "@/hooks/use-fake-loading";
import { reviewsFor } from "@/lib/mock-data";

type Sort = "recent" | "highest";

export function ProductReviews({ productId }: { productId: string }) {
  const [sort, setSort] = useState<Sort>("recent");
  const loading = useFakeLoading(800, [productId]);
  const all = useMemo(() => reviewsFor(productId), [productId]);

  const sorted = useMemo(() => {
    const list = [...all];
    list.sort((a, b) => (sort === "recent" ? a.daysAgo - b.daysAgo : b.rating - a.rating));
    return list;
  }, [all, sort]);

  const average = all.reduce((n, r) => n + r.rating, 0) / all.length;
  const buckets = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: all.filter((r) => r.rating === star).length,
  }));

  return (
    <section aria-labelledby="reviews" className="border-t border-border pt-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 id="reviews" className="font-display text-4xl">
          Reviews
        </h2>
        <div className="flex items-center gap-2">
          <label htmlFor="review-sort" className="text-xs text-muted-foreground">
            Sort by
          </label>
          <Select value={sort} onValueChange={(v) => setSort(v as Sort)}>
            <SelectTrigger id="review-sort" className="w-[10.5rem]" aria-label="Sort reviews">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most recent</SelectItem>
              <SelectItem value="highest">Highest rated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[16rem_1fr]">
        <div className="rounded-sm border border-border bg-card p-6">
          <p className="font-display text-5xl">{average.toFixed(1)}</p>
          <StarRating value={average} size="md" className="mt-2" />
          <p className="mt-2 text-xs text-muted-foreground">Based on {all.length} verified reviews</p>
          <ul className="mt-6 space-y-2">
            {buckets.map((b) => (
              <li key={b.star} className="flex items-center gap-3 text-xs">
                <span className="w-6 text-muted-foreground">{b.star}★</span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                  <span
                    className="block h-full bg-gold"
                    style={{ width: `${(b.count / all.length) * 100}%` }}
                  />
                </span>
                <span className="w-4 text-right text-muted-foreground">{b.count}</span>
              </li>
            ))}
          </ul>
        </div>

        <ul className="space-y-6" aria-busy={loading}>
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <li key={i} className="space-y-3 rounded-sm border border-border p-6">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-4 w-52" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </li>
              ))
            : sorted.map((r) => (
                <li key={r.id} className="rounded-sm border border-border bg-card p-6">
                  <div className="flex items-start gap-4">
                    <span
                      aria-hidden="true"
                      className="grid size-10 shrink-0 place-items-center rounded-full bg-secondary text-xs"
                    >
                      {r.initials}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="text-sm font-medium">{r.author}</span>
                        {r.verified ? (
                          <span className="inline-flex items-center gap-1 text-[0.65rem] text-success">
                            <BadgeCheck className="size-3.5" aria-hidden="true" />
                            Verified buyer
                          </span>
                        ) : null}
                        <span className="ml-auto text-xs text-muted-foreground">{r.date}</span>
                      </div>
                      <StarRating value={r.rating} className="mt-2" />
                      <h3 className="mt-3 font-display text-xl">{r.title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{r.body}</p>
                    </div>
                  </div>
                </li>
              ))}
        </ul>
      </div>
    </section>
  );
}
