"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useDeployments(namespace?: string) {
  return useQuery({
    queryKey: ["deployments", namespace],
    queryFn: () => api.listDeployments(namespace),
  });
}

export function useDeploymentYaml(name: string, namespace = "default") {
  return useQuery({
    queryKey: ["deployment-yaml", name, namespace],
    queryFn: () => api.getDeploymentYaml(name, namespace),
    enabled: !!name,
  });
}

export function useScaleDeployment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      name,
      replicas,
      namespace,
    }: {
      name: string;
      replicas: number;
      namespace?: string;
    }) => api.scaleDeployment(name, replicas, namespace),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deployments"] });
    },
  });
}

export function useRestartDeployment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      name,
      namespace,
    }: {
      name: string;
      namespace?: string;
    }) => api.restartDeployment(name, namespace),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deployments"] });
    },
  });
}

export function useRollbackDeployment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      name,
      namespace,
    }: {
      name: string;
      namespace?: string;
    }) => api.rollbackDeployment(name, namespace),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deployments"] });
    },
  });
}

export function useApplyDeploymentYaml() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      name,
      yamlContent,
      namespace,
    }: {
      name: string;
      yamlContent: string;
      namespace?: string;
    }) => api.applyDeploymentYaml(name, yamlContent, namespace),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["deployments"] });
      queryClient.invalidateQueries({ 
        queryKey: ["deployment-yaml", variables.name, variables.namespace || "default"] 
      });
    },
  });
}
