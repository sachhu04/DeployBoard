"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function usePods(namespace?: string) {
  return useQuery({
    queryKey: ["pods", namespace],
    queryFn: () => api.listPods(namespace),
  });
}

export function useDeletePod() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ name, namespace }: { name: string; namespace: string }) =>
      api.deletePod(name, namespace),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["pods"] });
      queryClient.invalidateQueries({ queryKey: ["deployments"] });
    },
  });
}
