import { useEffect } from "react";
import { applyFavicon, useBrandAssets } from "@/lib/brand-assets";
import { cn } from "@/lib/utils";

/**
 * Official Hair by Gold Beauty Hub & Spa mark, transparent background.
 * Two variants of the same artwork ship: the light-theme file uses ink-dark
 * "Beauty Hub & Spa" lettering, the dark-theme file keeps it white. CSS swaps
 * them with the active theme so no opaque chip is needed. Proportions are
 * preserved (1004x315) via object-contain. Owners can override either variant
 * (and the tab icon) locally from Settings → Brand assets.
 */
export function BrandLogo({
  className,
  imgClassName,
}: {
  className?: string;
  imgClassName?: string;
}) {
  const brand = useBrandAssets();

  useEffect(() => {
    applyFavicon(brand.favicon);
  }, [brand.favicon]);

  const imgClasses = cn(
    "h-8 w-auto max-w-full object-contain object-center sm:h-9",
    imgClassName,
  );

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center",
        className,
      )}
    >
      <img
        src={brand.logoLight}
        alt="Hair by Gold Beauty Hub & Spa"
        width={1004}
        height={315}
        className={cn(imgClasses, "block dark:hidden")}
        loading="eager"
        decoding="async"
      />
      <img
        src={brand.logoDark}
        alt=""
        width={1004}
        height={315}
        aria-hidden="true"
        className={cn(imgClasses, "hidden dark:block")}
        loading="eager"
        decoding="async"
      />
    </span>
  );
}
