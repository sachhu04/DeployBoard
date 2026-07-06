/* ─── API client abstraction ─── */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new ApiError(res.status, body);
  }

  return res.json();
}

/* ─── Deployments ─── */

import type {
  ActionResponse,
  ClusterEvent,
  Deployment,
  HealthCheck,
  Namespace,
  Pod,
  Service,
  ConfigMap,
  Secret,
  ClusterMetrics,
} from "./types";

export const api = {
  health: () => request<HealthCheck>("/api/health"),

  /* Deployments */
  listDeployments: (namespace?: string) => {
    const params = namespace ? `?namespace=${namespace}` : "";
    return request<Deployment[]>(`/api/deployments${params}`);
  },
  scaleDeployment: (name: string, replicas: number, namespace = "default") =>
    request<ActionResponse>(
      `/api/deployments/${name}/scale?namespace=${namespace}`,
      { method: "POST", body: JSON.stringify({ replicas }) },
    ),
  restartDeployment: (name: string, namespace = "default") =>
    request<ActionResponse>(
      `/api/deployments/${name}/restart?namespace=${namespace}`,
      { method: "POST" },
    ),
  rollbackDeployment: (name: string, namespace = "default") =>
    request<ActionResponse>(
      `/api/deployments/${name}/rollback?namespace=${namespace}`,
      { method: "POST" },
    ),
  getDeploymentYaml: (name: string, namespace = "default") =>
    request<{ yaml: string }>(
      `/api/deployments/${name}/yaml?namespace=${namespace}`,
    ),
  applyDeploymentYaml: (name: string, yamlContent: string, namespace = "default") =>
    request<ActionResponse>(
      `/api/deployments/${name}/yaml?namespace=${namespace}`,
      { method: "PUT", body: JSON.stringify({ yaml_content: yamlContent }) },
    ),

  /* Pods */
  listPods: (namespace?: string) => {
    const params = namespace ? `?namespace=${namespace}` : "";
    return request<Pod[]>(`/api/pods${params}`);
  },
  deletePod: (name: string, namespace = "default") =>
    request<ActionResponse>(
      `/api/pods/${name}?namespace=${namespace}`,
      { method: "DELETE" },
    ),

  /* Services */
  listServices: (namespace?: string) => {
    const params = namespace ? `?namespace=${namespace}` : "";
    return request<Service[]>(`/api/services${params}`);
  },

  /* Namespaces */
  listNamespaces: () => request<Namespace[]>("/api/namespaces"),

  /* Events */
  listEvents: (namespace?: string) => {
    const params = namespace ? `?namespace=${namespace}` : "";
    return request<ClusterEvent[]>(`/api/events${params}`);
  },

  /* ConfigMaps */
  listConfigMaps: (namespace?: string) => {
    const params = namespace ? `?namespace=${namespace}` : "";
    return request<ConfigMap[]>(`/api/configmaps${params}`);
  },

  /* Secrets */
  listSecrets: (namespace?: string) => {
    const params = namespace ? `?namespace=${namespace}` : "";
    return request<Secret[]>(`/api/secrets${params}`);
  },

  /* Metrics */
  getClusterMetrics: () => request<ClusterMetrics>("/api/metrics/cluster"),
} as const;

/* ─── WebSocket helpers ─── */

export function getLogWebSocketUrl(namespace: string, podName: string) {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//127.0.0.1:8000/ws/logs/${namespace}/${podName}`;
}

export function getExecWebSocketUrl(namespace: string, podName: string) {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//127.0.0.1:8000/ws/exec/${namespace}/${podName}`;
}
