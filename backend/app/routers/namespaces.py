"""Namespaces router."""

from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException

from app.k8s.client import get_kube_client
from app.k8s.mock_data import mock_namespaces
from app.models.schemas import NamespaceResponse

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/namespaces", tags=["namespaces"])


@router.get("", response_model=list[NamespaceResponse])
def list_namespaces():
    kube = get_kube_client()

    if kube.is_mock:
        return mock_namespaces()

    try:
        ns_list = kube.core_v1.list_namespace()
        return [
            NamespaceResponse(
                name=ns.metadata.name,
                status=ns.status.phase or "Active",
                age=str(ns.metadata.creation_timestamp),
            )
            for ns in ns_list.items
        ]
    except Exception as e:
        logger.error("Failed to list namespaces: %s", e)
        raise HTTPException(status_code=500, detail=str(e))
