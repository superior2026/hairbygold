import { createServerFn } from "@tanstack/react-start";
import type { Product } from "@/lib/mock-data";

/** Public catalogue as managed in the owner dashboard. */
export const listCatalog = createServerFn({ method: "GET" }).handler(async (): Promise<Product[]> => {
  const { fetchCatalog } = await import("@/lib/catalog.server");
  return fetchCatalog();
});

/** Owner-uploaded photos for salon services, keyed by service id. */
export const listServicePhotos = createServerFn({ method: "GET" }).handler(
  async (): Promise<Record<string, string>> => {
    const { fetchServicePhotos } = await import("@/lib/catalog.server");
    return fetchServicePhotos();
  },
);
