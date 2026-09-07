"use client";
import { useQuery } from "@tanstack/react-query";
import { getSite } from "@/services/site.service";

/**
 * Shipments are still local/mock and only store a real Site UUID
 * (`destination_site_id`) — the actual Site record lives on the real
 * backend now (see src/services/site.service.ts). This resolves that id
 * to a display name wherever a Shipment needs to show it. React Query
 * dedupes/caches by site id, so using this in every row of a table is
 * fine — it won't refetch the same site repeatedly.
 */
export const SiteName = ({ siteId }: { siteId?: string | null }) => {
  const { data, isLoading } = useQuery({
    queryKey: ["site-name", siteId],
    queryFn: () => getSite(siteId as string),
    enabled: !!siteId,
    staleTime: 5 * 60 * 1000,
  });

  if (!siteId) return <span className="text-muted">—</span>;
  if (isLoading) return <span className="text-muted">Loading…</span>;
  return <>{data?.name ?? "Unknown site"}</>;
};

export default SiteName;
