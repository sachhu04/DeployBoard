"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useConfigMaps(namespace?: string) {
  return useQuery({
    queryKey: ["configmaps", namespace],
    queryFn: () => api.listConfigMaps(namespace),
  });
}
