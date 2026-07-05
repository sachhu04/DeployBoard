"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useNamespaces() {
  return useQuery({
    queryKey: ["namespaces"],
    queryFn: () => api.listNamespaces(),
  });
}
