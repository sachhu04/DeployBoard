"""ConfigMaps router — list configmaps."""

from __future__ import annotations

import logging
from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from app.k8s.client import get_kube_client
from app.k8s.mock_data import mock_configmaps
from app.models.schemas import ConfigMapResponse

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/configmaps", tags=["configmaps"])


@router.get("", response_model=list[ConfigMapResponse])
async def list_configmaps(namespace: Optional[str] = Query(None)):
    kube = get_kube_client()

    if kube.is_mock:
        return mock_configmaps(namespace)

    try:
        if namespace and namespace != "all":
            cms = kube.core_v1.list_namespaced_config_map(namespace)
        else:
            cms = kube.core_v1.list_config_map_for_all_namespaces()

        results = []
        for cm in cms.items:
            age_delta = cm.metadata.creation_timestamp
            
            # Use 'data' length for keys count
            data_keys = len(cm.data) if cm.data else 0

            results.append(ConfigMapResponse(
                name=cm.metadata.name,
                namespace=cm.metadata.namespace,
                data_keys=data_keys,
                age=str(age_delta),
                created_at=age_delta.isoformat() if age_delta else "",
            ))
        return results
    except Exception as e:
        logger.error("Failed to list configmaps: %s", e)
        raise HTTPException(status_code=500, detail=str(e))
