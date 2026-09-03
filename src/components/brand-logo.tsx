import logoAsset from "@/assets/hair-by-gold-wordmark.png.asset.json";
import { cn } from "@/lib/utils";

/**
 * Official Hair by Gold Beauty Hub & Spa mark. The artwork ships on its own dark
 * backdrop, so it always sits inside an ink chip — legible on both light and
 * dark themes, with proportions preserved via object-contain.
 */
export function BrandLogo({
  className,
  imgClassName,
}: {
  className?: string;
  imgClassName?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center overflow-hidden rounded-sm bg-[oklch(0.19_0.014_52)] px-2.5 py-1.5 ring-1 ring-border",
        className,
      )}
    >
      <img
        src={logoAsset.url}
        alt="Hair by Gold Beauty Hub & Spa"
        width={1051}
        height={362}
        className={cn("h-7 w-auto object-contain sm:h-8", imgClassName)}
        loading="eager"
        decoding="async"
      />
    </span>
  );
}
