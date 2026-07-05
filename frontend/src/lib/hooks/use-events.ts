"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useEvents(namespace?: string) {
  return useQuery({
    queryKey: ["events", namespace],
    queryFn: () => api.listEvents(namespace),
  });
}
