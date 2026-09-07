import { useEffect, useState } from "react";
import logoDark from "@/assets/hair-by-gold-logo-dark.png.asset.json";
import logoLight from "@/assets/hair-by-gold-logo-light.png.asset.json";

/**
 * Frontend-only "rebrand" store. Uploaded logos live as data URLs in this
 * browser's localStorage — nothing is uploaded, shared or persisted anywhere
 * else. Cloud storage would be required for real, shared branding.
 */

export type BrandSlot = "logoLight" | "logoDark" | "favicon";

export const DEFAULT_BRAND = {
  logoLight: logoLight.url,
  logoDark: logoDark.url,
  favicon: "/favicon.png",
} as const satisfies Record<BrandSlot, string>;

export type BrandAssets = Record<BrandSlot, string>;

const STORAGE_KEY = "hbg-brand-assets";
const CHANGE_EVENT = "hbg-brand-assets-change";

/** Canonical brand gold and the favicon tile it sits on. */
export const BRAND_GOLD_HEX = "#d5af59";
export const FAVICON_TILE_HEX = "#241c14";

export const MAX_UPLOAD_BYTES = 512 * 1024;
export const ACCEPTED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
] as const;

export function validateImageFile(file: { type: string; size: number }): string | null {
  if (!(ACCEPTED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
    return "Use a PNG, JPG, WEBP or SVG image.";
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return "Image must be 512 KB or smaller.";
  }
  if (file.size === 0) return "That file is empty.";
  return null;
}

function relativeLuminance(hex: string): number {
  const h = hex.replace("#", "");
  const parts = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  const lin = parts.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * lin[0]! + 0.7152 * lin[1]! + 0.0722 * lin[2]!;
}

/** WCAG contrast ratio between two hex colors. */
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

export function readBrandAssets(): BrandAssets {
  if (typeof window === "undefined") return { ...DEFAULT_BRAND };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_BRAND };
    const parsed = JSON.parse(raw) as Partial<BrandAssets>;
    return {
      logoLight: parsed.logoLight || DEFAULT_BRAND.logoLight,
      logoDark: parsed.logoDark || DEFAULT_BRAND.logoDark,
      favicon: parsed.favicon || DEFAULT_BRAND.favicon,
    };
  } catch {
    return { ...DEFAULT_BRAND };
  }
}

function persist(next: BrandAssets) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
}

export function setBrandAsset(slot: BrandSlot, dataUrl: string) {
  persist({ ...readBrandAssets(), [slot]: dataUrl });
}

export function resetBrandAsset(slot: BrandSlot) {
  persist({ ...readBrandAssets(), [slot]: DEFAULT_BRAND[slot] });
}

export function resetAllBrandAssets() {
  window.localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read that file."));
    reader.readAsDataURL(file);
  });
}

/** Live brand assets for this browser; defaults during SSR/first paint. */
export function useBrandAssets(): BrandAssets {
  const [assets, setAssets] = useState<BrandAssets>({ ...DEFAULT_BRAND });

  useEffect(() => {
    const sync = () => setAssets(readBrandAssets());
    sync();
    window.addEventListener(CHANGE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return assets;
}

/** Point the browser tab icon at the current favicon selection. */
export function applyFavicon(href: string) {
  if (typeof document === "undefined") return;
  let link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  if (link.getAttribute("href") !== href) link.setAttribute("href", href);
}
