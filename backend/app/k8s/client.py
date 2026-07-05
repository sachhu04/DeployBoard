"""
Kubernetes client singleton with automatic mock fallback.

Attempts to connect to a real K8s cluster via kubeconfig or in-cluster config.
Falls back to mock mode when no cluster is available, enabling full frontend
development without a running cluster.
"""

from __future__ import annotations

import logging
from typing import Optional

from kubernetes import client, config
from kubernetes.client import AppsV1Api, CoreV1Api

logger = logging.getLogger(__name__)


class KubeClient:
    """Thread-safe singleton wrapping the K8s Python client."""

    _instance: Optional["KubeClient"] = None
    _core_v1: Optional[CoreV1Api] = None
    _apps_v1: Optional[AppsV1Api] = None
    _mock_mode: bool = False

    def __new__(cls) -> "KubeClient":
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialize()
        return cls._instance

    def _initialize(self) -> None:
        try:
            config.load_incluster_config()
            logger.info("Loaded in-cluster Kubernetes config")
        except config.ConfigException:
            try:
                config.load_kube_config()
                logger.info("Loaded kubeconfig from default location")
            except config.ConfigException:
                logger.warning(
                    "No Kubernetes config found — running in MOCK MODE. "
                    "All API responses will return simulated data."
                )
                self._mock_mode = True
                return

        self._core_v1 = CoreV1Api()
        self._apps_v1 = AppsV1Api()

    @property
    def is_mock(self) -> bool:
        return self._mock_mode

    @property
    def core_v1(self) -> CoreV1Api:
        if self._mock_mode:
            raise RuntimeError("K8s client unavailable in mock mode")
        assert self._core_v1 is not None
        return self._core_v1

    @property
    def apps_v1(self) -> AppsV1Api:
        if self._mock_mode:
            raise RuntimeError("K8s client unavailable in mock mode")
        assert self._apps_v1 is not None
        return self._apps_v1


def get_kube_client() -> KubeClient:
    """Return the global KubeClient singleton."""
    return KubeClient()
