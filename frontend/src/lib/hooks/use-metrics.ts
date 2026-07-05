"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useClusterMetrics() {
  return useQuery({
    queryKey: ["cluster-metrics"],
    queryFn: () => api.getClusterMetrics(),
    refetchInterval: 10000, // Refetch every 10 seconds for real-time feel
  });
}
