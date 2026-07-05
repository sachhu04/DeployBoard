"""Pydantic response models for type-safe API responses."""

from __future__ import annotations

from pydantic import BaseModel


class DeploymentResponse(BaseModel):
    name: str
    namespace: str
    ready_replicas: int
    desired_replicas: int
    status: str
    image: str
    age: str
    created_at: str


class PodResponse(BaseModel):
    name: str
    namespace: str
    status: str
    restarts: int
    node: str
    age: str
    created_at: str
    ip: str


class ServiceResponse(BaseModel):
    name: str
    namespace: str
    type: str
    cluster_ip: str
    port: int
    target_port: int
    age: str


class NamespaceResponse(BaseModel):
    name: str
    status: str
    age: str


class EventResponse(BaseModel):
    type: str
    reason: str
    message: str
    namespace: str
    involved_object: str
    last_seen: str
    age: str
    count: int


class ScaleRequest(BaseModel):
    replicas: int


class ActionResponse(BaseModel):
    success: bool
    message: str
    kubectl_command: str
    explanation: str


class ConfigMapResponse(BaseModel):
    name: str
    namespace: str
    data_keys: int
    age: str
    created_at: str


class SecretResponse(BaseModel):
    name: str
    namespace: str
    type: str
    data_keys: int
    age: str
    created_at: str


class ApplyYamlRequest(BaseModel):
    yaml_content: str
