import logoAsset from "@/assets/hair-by-gold-logo.png.asset.json";
import { cn } from "@/lib/utils";

/**
 * Official Hair by Gold Beauty Hub & Spa mark. The supplied artwork has a dark
 * backdrop baked in, so it always sits on an ink chip — legible in both themes
 * without altering the artwork.
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
        "inline-flex items-center justify-center overflow-hidden rounded-sm bg-[oklch(0.19_0.014_52)] px-2 py-1 ring-1 ring-border",
        className,
      )}
    >
      <img
        src={logoAsset.url}
        alt="Hair by Gold Beauty Hub & Spa"
        width={1254}
        height={1254}
        className={cn("h-9 w-auto object-contain sm:h-10", imgClassName)}
        loading="eager"
        decoding="async"
      />
    </span>
  );
}
