"""Secrets router — list secrets (metadata only)."""

from __future__ import annotations

import logging
from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from app.k8s.client import get_kube_client
from app.k8s.mock_data import mock_secrets
from app.models.schemas import SecretResponse

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/secrets", tags=["secrets"])


@router.get("", response_model=list[SecretResponse])
async def list_secrets(namespace: Optional[str] = Query(None)):
    kube = get_kube_client()

    if kube.is_mock:
        return mock_secrets(namespace)

    try:
        if namespace and namespace != "all":
            secrets = kube.core_v1.list_namespaced_secret(namespace)
        else:
            secrets = kube.core_v1.list_secret_for_all_namespaces()

        results = []
        for s in secrets.items:
            age_delta = s.metadata.creation_timestamp
            
            # Use 'data' length for keys count (safely)
            data_keys = len(s.data) if s.data else 0

            results.append(SecretResponse(
                name=s.metadata.name,
                namespace=s.metadata.namespace,
                type=s.type,
                data_keys=data_keys,
                age=str(age_delta),
                created_at=age_delta.isoformat() if age_delta else "",
            ))
        return results
    except Exception as e:
        logger.error("Failed to list secrets: %s", e)
        raise HTTPException(status_code=500, detail=str(e))
