import { Check } from "lucide-react";
import { trackingSteps } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function TrackingTimeline({
  currentIndex,
  dates,
}: {
  currentIndex: number;
  dates?: string[];
}) {
  return (
    <ol className="relative space-y-8 border-l border-border pl-8">
      {trackingSteps.map((step, i) => {
        const done = i <= currentIndex;
        const current = i === currentIndex;
        return (
          <li key={step} className="relative">
            <span
              aria-hidden="true"
              className={cn(
                "absolute -left-[2.55rem] grid size-6 place-items-center rounded-full border",
                done
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground",
              )}
            >
              {done ? <Check className="size-3.5" /> : <span className="size-1.5 rounded-full bg-current" />}
            </span>
            <p className={cn("text-sm", done ? "text-foreground" : "text-muted-foreground")}>
              {step}
              {current ? (
                <span className="ml-2 rounded-sm bg-secondary px-2 py-0.5 text-[0.6rem] tracking-luxe text-primary">
                  Current
                </span>
              ) : null}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {done ? (dates?.[i] ?? "Completed") : "Pending"}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
