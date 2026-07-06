"""Pods router — list and detail."""

from __future__ import annotations

import logging
from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from app.k8s.client import get_kube_client
from app.k8s.mock_data import mock_pods
from app.models.schemas import PodResponse, ActionResponse

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/pods", tags=["pods"])


@router.get("", response_model=list[PodResponse])
def list_pods(namespace: Optional[str] = Query(None)):
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
            status_obj = getattr(p, "status", None)
            spec_obj = getattr(p, "spec", None)

            status = status_obj.phase if status_obj and status_obj.phase else "Unknown"
            
            if p.metadata and getattr(p.metadata, "deletion_timestamp", None):
                status = "Terminating"
                
            restarts = 0
            if status_obj and status_obj.container_statuses:
                restarts = sum(cs.restart_count for cs in status_obj.container_statuses)
                # Check for CrashLoopBackOff
                for cs in status_obj.container_statuses:
                    if getattr(cs, "state", None) and getattr(cs.state, "waiting", None) and getattr(cs.state.waiting, "reason", None):
                        status = cs.state.waiting.reason
                        break

            node_name = spec_obj.node_name if spec_obj and spec_obj.node_name else "Pending"
            pod_ip = status_obj.pod_ip if status_obj and status_obj.pod_ip else "N/A"

            results.append(PodResponse(
                name=p.metadata.name,
                namespace=p.metadata.namespace,
                status=status,
                restarts=restarts,
                node=node_name,
                age=str(p.metadata.creation_timestamp),
                created_at=p.metadata.creation_timestamp.isoformat() if p.metadata.creation_timestamp else "",
                ip=pod_ip,
            ))
        return results
    except Exception as e:
        logger.error("Failed to list pods: %s", e)
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{name}", response_model=ActionResponse)
def delete_pod(name: str, namespace: str = Query("default")):
    kube = get_kube_client()

    if kube.is_mock:
        return ActionResponse(
            success=True,
            message=f"Deleted pod {name} (mock)",
            kubectl_command=f"kubectl delete pod {name} -n {namespace}",
            explanation=f"Deletes the pod '{name}'. A new pod will be created by the ReplicaSet."
        )

    try:
        kube.core_v1.delete_namespaced_pod(name=name, namespace=namespace)
        return ActionResponse(
            success=True,
            message=f"Pod {name} has been deleted and will be recreated if managed by a deployment.",
            kubectl_command=f"kubectl delete pod {name} -n {namespace}",
            explanation=f"Deletes the pod '{name}'. If it is part of a deployment, Kubernetes will automatically create a replacement."
        )
    except Exception as e:
        logger.error("Failed to delete pod %s: %s", name, e)
        raise HTTPException(status_code=500, detail=str(e))
