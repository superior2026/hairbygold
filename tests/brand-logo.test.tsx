import { readFileSync } from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { BrandLogo } from "@/components/brand-logo";
import {
  BRAND_GOLD_HEX,
  contrastRatio,
  DEFAULT_BRAND,
  FAVICON_TILE_HEX,
  MAX_UPLOAD_BYTES,
  validateImageFile,
} from "@/lib/brand-assets";

const markup = renderToStaticMarkup(<BrandLogo />);

/**
 * Visual regression safeguards for the shared brand mark: both theme variants
 * must ship, keep their aspect ratio, stay accessible, and the tab icon must
 * stay high-contrast regardless of the browser background.
 */
describe("shared brand logo", () => {
  it("renders both theme variants", () => {
    expect(markup).toContain(DEFAULT_BRAND.logoLight);
    expect(markup).toContain(DEFAULT_BRAND.logoDark);
  });

  it("swaps variants with the active theme", () => {
    expect(markup).toContain("block dark:hidden");
    expect(markup).toContain("hidden dark:block");
  });

  it("keeps one meaningful alt text and hides the duplicate", () => {
    expect(markup).toContain('alt="Hair by Gold Beauty Hub &amp; Spa"');
    expect(markup).toContain('aria-hidden="true"');
    expect(markup.match(/Hair by Gold Beauty Hub/g)).toHaveLength(1);
  });

  it("preserves artwork proportions without cropping or stretching", () => {
    expect(markup).toContain('width="1004"');
    expect(markup).toContain('height="315"');
    expect(markup).toContain("object-contain");
    expect(markup).not.toContain("object-cover");
  });

  it("scales responsively from the shared default size", () => {
    expect(markup).toContain("h-8");
    expect(markup).toContain("sm:h-9");
  });
});

describe("tab icon", () => {
  it("keeps the gold mark well above WCAG AA against its tile", () => {
    expect(contrastRatio(BRAND_GOLD_HEX, FAVICON_TILE_HEX)).toBeGreaterThan(4.5);
  });

  it("stays legible on both white and black browser chrome", () => {
    expect(contrastRatio(FAVICON_TILE_HEX, "#ffffff")).toBeGreaterThan(3);
    expect(contrastRatio(BRAND_GOLD_HEX, "#000000")).toBeGreaterThan(3);
  });

  it("ships a square PNG icon", () => {
    const buf = readFileSync(path.join(process.cwd(), "public/favicon.png"));
    expect(buf.subarray(1, 4).toString()).toBe("PNG");
    const width = buf.readUInt32BE(16);
    const height = buf.readUInt32BE(20);
    expect(width).toBe(height);
    expect(width).toBeGreaterThanOrEqual(32);
  });
});

describe("brand asset uploads", () => {
  it("accepts common image types", () => {
    expect(validateImageFile({ type: "image/png", size: 2048 })).toBeNull();
    expect(validateImageFile({ type: "image/svg+xml", size: 2048 })).toBeNull();
  });

  it("rejects wrong types, empty and oversized files", () => {
    expect(validateImageFile({ type: "application/pdf", size: 2048 })).toBeTruthy();
    expect(validateImageFile({ type: "image/png", size: 0 })).toBeTruthy();
    expect(validateImageFile({ type: "image/png", size: MAX_UPLOAD_BYTES + 1 })).toBeTruthy();
  });
});
