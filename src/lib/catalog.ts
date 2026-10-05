import { queryOptions, useQuery } from "@tanstack/react-query";
import { listCatalog } from "@/lib/catalog.functions";

export const catalogQuery = queryOptions({
  queryKey: ["catalog"],
  queryFn: () => listCatalog(),
  staleTime: 60_000,
});

/** Non-suspending catalogue access for shared chrome (search, store). */
export function useCatalog() {
  return useQuery(catalogQuery).data ?? [];
}
