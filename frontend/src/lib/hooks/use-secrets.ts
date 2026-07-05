"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useSecrets(namespace?: string) {
  return useQuery({
    queryKey: ["secrets", namespace],
    queryFn: () => api.listSecrets(namespace),
  });
}
