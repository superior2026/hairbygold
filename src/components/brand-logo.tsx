import logoDark from "@/assets/hair-by-gold-logo-dark.png.asset.json";
import logoLight from "@/assets/hair-by-gold-logo-light.png.asset.json";
import { cn } from "@/lib/utils";

/**
 * Official Hair by Gold Beauty Hub & Spa mark, transparent background.
 * Two variants of the same artwork ship: the light-theme file uses ink-dark
 * "Beauty Hub & Spa" lettering, the dark-theme file keeps it white. CSS swaps
 * them with the active theme so no opaque chip is needed. Proportions are
 * preserved (1004x315) via object-contain.
 */
export function BrandLogo({
  className,
  imgClassName,
}: {
  className?: string;
  imgClassName?: string;
}) {
  const imgClasses = cn(
    "h-7 w-auto max-w-full object-contain object-center sm:h-8",
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
        src={logoLight.url}
        alt="Hair by Gold Beauty Hub & Spa"
        width={1004}
        height={315}
        className={cn(imgClasses, "block dark:hidden")}
        loading="eager"
        decoding="async"
      />
      <img
        src={logoDark.url}
        alt="Hair by Gold Beauty Hub & Spa"
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
