"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useServices(namespace?: string) {
  return useQuery({
    queryKey: ["services", namespace],
    queryFn: () => api.listServices(namespace),
  });
}
