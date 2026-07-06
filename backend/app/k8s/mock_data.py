"""
Mock data generator for demo mode.

Produces realistic Kubernetes-style responses so the frontend can be fully
developed and demonstrated without a running cluster.
"""

from __future__ import annotations

import random
import time
from datetime import datetime, timedelta, timezone
from typing import Any


_DEPLOYMENT_NAMES = [
    "frontend",
    "backend-api",
    "auth-service",
    "payment-gateway",
    "notification-svc",
    "analytics-worker",
    "cache-proxy",
    "search-indexer",
]

_NAMESPACES = ["default", "production", "staging", "monitoring", "kube-system"]

_NODE_NAMES = [
    "kind-control-plane",
    "kind-worker",
    "kind-worker2",
]

_IMAGES = [
    "nginx:1.25-alpine",
    "node:20-slim",
    "python:3.12-slim",
    "redis:7-alpine",
    "postgres:16-alpine",
    "golang:1.22-alpine",
]

_LOG_LINES = [
    "INFO: Server listening on port 8080",
    "DEBUG: Processing request GET /api/health",
    "INFO: Connected to database cluster",
    "WARN: High memory usage detected (82%)",
    "INFO: Request completed in 23ms",
    "DEBUG: Cache hit for key user:1234",
    "INFO: Graceful shutdown initiated",
    "ERROR: Connection timeout after 30s — retrying",
    "INFO: Worker process spawned (pid: 4821)",
    "DEBUG: JWT token validated successfully",
    "INFO: Metrics exported to /metrics endpoint",
    "WARN: Rate limiter triggered for IP 10.0.0.15",
    "INFO: Health check passed — all dependencies OK",
    "DEBUG: Message published to queue notifications",
    "INFO: TLS certificate valid for 342 more days",
    "ERROR: Upstream service returned 503 — circuit breaker open",
    "INFO: Batch job completed — processed 1,247 records",
    "DEBUG: WebSocket connection established from client #89",
]


def _age_string(minutes: int) -> str:
    if minutes < 60:
        return f"{minutes}m"
    hours = minutes // 60
    if hours < 24:
        return f"{hours}h"
    days = hours // 24
    return f"{days}d"


def _random_age() -> tuple[str, str]:
    minutes = random.randint(5, 10080)  # up to 7 days
    created = datetime.now(timezone.utc) - timedelta(minutes=minutes)
    return _age_string(minutes), created.isoformat()


def mock_namespaces() -> list[dict[str, Any]]:
    return [
        {
            "name": ns,
            "status": "Active",
            "age": _age_string(random.randint(1440, 43200)),
        }
        for ns in _NAMESPACES
    ]


def mock_deployments(namespace: str | None = None) -> list[dict[str, Any]]:
    results = []
    target_ns = [namespace] if namespace and namespace != "all" else _NAMESPACES[:3]

    for ns in target_ns:
        count = random.randint(2, 4) if ns != "kube-system" else 1
        for name in random.sample(_DEPLOYMENT_NAMES, min(count, len(_DEPLOYMENT_NAMES))):
            desired = random.choice([1, 2, 3, 4])
            ready = desired if random.random() > 0.15 else max(0, desired - random.randint(1, 2))
            age, created = _random_age()
            status = "Available" if ready == desired else "Progressing"

            results.append({
                "name": name,
                "namespace": ns,
                "ready_replicas": ready,
                "desired_replicas": desired,
                "status": status,
                "image": random.choice(_IMAGES),
                "age": age,
                "created_at": created,
            })

    return results


def mock_pods(namespace: str | None = None) -> list[dict[str, Any]]:
    deployments = mock_deployments(namespace)
    pods = []

    for dep in deployments:
        for i in range(dep["ready_replicas"]):
            suffix = f"{''.join(random.choices('abcdef0123456789', k=5))}-{''.join(random.choices('abcdef0123456789', k=5))}"
            age, created = _random_age()
            restarts = random.choices([0, 0, 0, 1, 2, 5], weights=[60, 20, 10, 5, 3, 2])[0]
            statuses = ["Running"] * 85 + ["Pending"] * 5 + ["CrashLoopBackOff"] * 5 + ["Completed"] * 5
            pods.append({
                "name": f"{dep['name']}-{suffix}",
                "namespace": dep["namespace"],
                "status": random.choice(statuses),
                "restarts": restarts,
                "node": random.choice(_NODE_NAMES),
                "age": age,
                "created_at": created,
                "ip": f"10.244.{random.randint(0, 3)}.{random.randint(2, 254)}",
            })

    return pods


def mock_services(namespace: str | None = None) -> list[dict[str, Any]]:
    target_ns = [namespace] if namespace and namespace != "all" else _NAMESPACES[:3]
    services = []

    for ns in target_ns:
        deployments = [d for d in mock_deployments(ns) if d["namespace"] == ns]
        for dep in deployments[:3]:
            svc_type = random.choice(["ClusterIP", "ClusterIP", "ClusterIP", "NodePort", "LoadBalancer"])
            port = random.choice([80, 443, 3000, 8080, 8443, 9090])
            age, _ = _random_age()
            services.append({
                "name": f"{dep['name']}-svc",
                "namespace": ns,
                "type": svc_type,
                "cluster_ip": f"10.96.{random.randint(0, 255)}.{random.randint(1, 254)}",
                "port": port,
                "target_port": port,
                "age": age,
            })

    # Always include kubernetes default service
    services.insert(0, {
        "name": "kubernetes",
        "namespace": "default",
        "type": "ClusterIP",
        "cluster_ip": "10.96.0.1",
        "port": 443,
        "target_port": 6443,
        "age": "30d",
    })

    return services


def mock_events(namespace: str | None = None) -> list[dict[str, Any]]:
    event_types = [
        ("Normal", "Scheduled", "Successfully assigned {ns}/{pod} to {node}"),
        ("Normal", "Pulled", "Container image \"{image}\" already present on machine"),
        ("Normal", "Created", "Created container {name}"),
        ("Normal", "Started", "Started container {name}"),
        ("Warning", "BackOff", "Back-off restarting failed container {name}"),
        ("Normal", "Killing", "Stopping container {name}"),
        ("Warning", "Unhealthy", "Readiness probe failed: connection refused"),
        ("Normal", "ScalingReplicaSet", "Scaled up replica set {name} to {count}"),
        ("Normal", "SuccessfulCreate", "Created pod: {name}-{suffix}"),
        ("Warning", "FailedScheduling", "0/{count} nodes are available: insufficient cpu"),
    ]

    events = []
    for _ in range(20):
        evt_type, reason, msg_template = random.choice(event_types)
        ns = namespace if namespace and namespace != "all" else random.choice(_NAMESPACES[:3])
        name = random.choice(_DEPLOYMENT_NAMES)
        minutes_ago = random.randint(1, 1440)
        last_seen = datetime.now(timezone.utc) - timedelta(minutes=minutes_ago)

        msg = msg_template.format(
            ns=ns,
            pod=f"{name}-{''.join(random.choices('abcdef0123456789', k=5))}",
            node=random.choice(_NODE_NAMES),
            image=random.choice(_IMAGES),
            name=name,
            count=random.randint(1, 5),
            suffix="".join(random.choices("abcdef0123456789", k=5)),
        )

        events.append({
            "type": evt_type,
            "reason": reason,
            "message": msg,
            "namespace": ns,
            "involved_object": name,
            "last_seen": last_seen.isoformat(),
            "age": _age_string(minutes_ago),
            "count": random.randint(1, 12),
        })

    events.sort(key=lambda e: str(e["last_seen"]), reverse=True)
    return events


def mock_deployment_yaml(name: str, namespace: str = "default") -> str:
    replicas = random.choice([1, 2, 3])
    image = random.choice(_IMAGES)
    return f"""apiVersion: apps/v1
kind: Deployment
metadata:
  name: {name}
  namespace: {namespace}
  labels:
    app: {name}
    managed-by: deployboard
spec:
  replicas: {replicas}
  selector:
    matchLabels:
      app: {name}
  template:
    metadata:
      labels:
        app: {name}
    spec:
      containers:
      - name: {name}
        image: {image}
        ports:
        - containerPort: 8080
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /healthz
            port: 8080
          initialDelaySeconds: 15
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
"""


def mock_log_line() -> str:
    ts = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"
    return f"{ts}  {random.choice(_LOG_LINES)}"


def mock_configmaps(namespace: str | None = None) -> list[dict[str, Any]]:
    target_ns = [namespace] if namespace and namespace != "all" else _NAMESPACES[:3]
    cm_names = ["app-config", "db-config", "feature-flags", "redis-settings", "ui-config"]
    
    results = []
    for ns in target_ns:
        count = random.randint(2, 4)
        for name in random.sample(cm_names, count):
            age, created = _random_age()
            keys = random.randint(1, 5)
            results.append({
                "name": name,
                "namespace": ns,
                "data_keys": keys,
                "age": age,
                "created_at": created,
            })
    return results


def mock_secrets(namespace: str | None = None) -> list[dict[str, Any]]:
    target_ns = [namespace] if namespace and namespace != "all" else _NAMESPACES[:3]
    secret_names = ["db-credentials", "api-tokens", "tls-certs", "jwt-secret", "oauth-keys"]
    secret_types = ["Opaque", "kubernetes.io/tls", "kubernetes.io/service-account-token", "Opaque", "Opaque"]
    
    results = []
    for ns in target_ns:
        count = random.randint(1, 3)
        for name in random.sample(secret_names, count):
            age, created = _random_age()
            keys = random.randint(1, 3)
            results.append({
                "name": name,
                "namespace": ns,
                "type": random.choice(secret_types),
                "data_keys": keys,
                "age": age,
                "created_at": created,
            })
    return results
