import { createServerFn } from "@tanstack/react-start";
import type { Product } from "@/lib/mock-data";

/** Public catalogue as managed in the owner dashboard. */
export const listCatalog = createServerFn({ method: "GET" }).handler(async (): Promise<Product[]> => {
  const { fetchCatalog } = await import("@/lib/catalog.server");
  return fetchCatalog();
});
