/* ─── Shared TypeScript types for DeployBoard ─── */

export interface Deployment {
  name: string;
  namespace: string;
  ready_replicas: number;
  desired_replicas: number;
  status: string;
  image: string;
  age: string;
  created_at: string;
}

export interface Pod {
  name: string;
  namespace: string;
  status: string;
  restarts: number;
  node: string;
  age: string;
  created_at: string;
  ip: string;
}

export interface Service {
  name: string;
  namespace: string;
  type: string;
  cluster_ip: string;
  port: number;
  target_port: number;
  age: string;
}

export interface Namespace {
  name: string;
  status: string;
  age: string;
}

export interface ClusterEvent {
  type: string;
  reason: string;
  message: string;
  namespace: string;
  involved_object: string;
  last_seen: string;
  age: string;
  count: number;
}

export interface ActionResponse {
  success: boolean;
  message: string;
  kubectl_command: string;
  explanation: string;
}

export interface HealthCheck {
  status: string;
  mode: "mock" | "live";
  version: string;
}

export interface ConfigMap {
  name: string;
  namespace: string;
  data_keys: number;
  age: string;
  created_at: string;
}

export interface Secret {
  name: string;
  namespace: string;
  type: string;
  data_keys: number;
  age: string;
  created_at: string;
}

export interface MetricPoint {
  time: string;
  cpu: number;
  memory: number;
}

export interface ClusterMetrics {
  current: {
    cpu: number;
    memory: number;
  };
  history: MetricPoint[];
}
