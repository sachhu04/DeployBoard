"""Services router."""

from __future__ import annotations

import logging
from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from app.k8s.client import get_kube_client
from app.k8s.mock_data import mock_services
from app.models.schemas import ServiceResponse

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/services", tags=["services"])


@router.get("", response_model=list[ServiceResponse])
async def list_services(namespace: Optional[str] = Query(None)):
    kube = get_kube_client()

    if kube.is_mock:
        return mock_services(namespace)

    try:
        if namespace and namespace != "all":
            svcs = kube.core_v1.list_namespaced_service(namespace)
        else:
            svcs = kube.core_v1.list_service_for_all_namespaces()

        results = []
        for s in svcs.items:
            port = s.spec.ports[0] if s.spec.ports else None
            results.append(ServiceResponse(
                name=s.metadata.name,
                namespace=s.metadata.namespace,
                type=s.spec.type or "ClusterIP",
                cluster_ip=s.spec.cluster_ip or "None",
                port=port.port if port else 0,
                target_port=int(port.target_port) if port and port.target_port else 0,
                age=str(s.metadata.creation_timestamp),
            ))
        return results
    except Exception as e:
        logger.error("Failed to list services: %s", e)
        raise HTTPException(status_code=500, detail=str(e))
