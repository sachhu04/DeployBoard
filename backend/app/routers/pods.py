"""Pods router — list and detail."""

from __future__ import annotations

import logging
from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from app.k8s.client import get_kube_client
from app.k8s.mock_data import mock_pods
from app.models.schemas import PodResponse

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/pods", tags=["pods"])


@router.get("", response_model=list[PodResponse])
async def list_pods(namespace: Optional[str] = Query(None)):
    kube = get_kube_client()

    if kube.is_mock:
        return mock_pods(namespace)

    try:
        if namespace and namespace != "all":
            pods = kube.core_v1.list_namespaced_pod(namespace)
        else:
            pods = kube.core_v1.list_pod_for_all_namespaces()

        results = []
        for p in pods.items:
            status = p.status.phase or "Unknown"
            restarts = 0
            if p.status.container_statuses:
                restarts = sum(cs.restart_count for cs in p.status.container_statuses)

            # Check for CrashLoopBackOff
            if p.status.container_statuses:
                for cs in p.status.container_statuses:
                    if cs.state and cs.state.waiting and cs.state.waiting.reason:
                        status = cs.state.waiting.reason
                        break

            results.append(PodResponse(
                name=p.metadata.name,
                namespace=p.metadata.namespace,
                status=status,
                restarts=restarts,
                node=p.spec.node_name or "Pending",
                age=str(p.metadata.creation_timestamp),
                created_at=p.metadata.creation_timestamp.isoformat() if p.metadata.creation_timestamp else "",
                ip=p.status.pod_ip or "N/A",
            ))
        return results
    except Exception as e:
        logger.error("Failed to list pods: %s", e)
        raise HTTPException(status_code=500, detail=str(e))
