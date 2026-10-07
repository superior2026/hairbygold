import { queryOptions, useQuery } from "@tanstack/react-query";
import { listCatalog, listServicePhotos } from "@/lib/catalog.functions";

export const catalogQuery = queryOptions({
  queryKey: ["catalog"],
  queryFn: () => listCatalog(),
  staleTime: 0,
  refetchOnWindowFocus: true,
  refetchInterval: 30_000,
});

export const servicePhotosQuery = queryOptions({
  queryKey: ["service-photos"],
  queryFn: () => listServicePhotos(),
  staleTime: 0,
});

/** Non-suspending catalogue access for shared chrome (search, store). */
export function useCatalog() {
  return useQuery(catalogQuery).data ?? [];
}
