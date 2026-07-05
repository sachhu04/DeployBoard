"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function usePods(namespace?: string) {
  return useQuery({
    queryKey: ["pods", namespace],
    queryFn: () => api.listPods(namespace),
  });
}
