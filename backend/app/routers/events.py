"""Events router."""

from __future__ import annotations

import logging
from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from app.k8s.client import get_kube_client
from app.k8s.mock_data import mock_events
from app.models.schemas import EventResponse

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/events", tags=["events"])


@router.get("", response_model=list[EventResponse])
async def list_events(namespace: Optional[str] = Query(None)):
    kube = get_kube_client()

    if kube.is_mock:
        return mock_events(namespace)

    try:
        if namespace and namespace != "all":
            events = kube.core_v1.list_namespaced_event(namespace)
        else:
            events = kube.core_v1.list_event_for_all_namespaces()

        results = []
        for e in events.items:
            results.append(EventResponse(
                type=e.type or "Normal",
                reason=e.reason or "",
                message=e.message or "",
                namespace=e.metadata.namespace or "",
                involved_object=e.involved_object.name if e.involved_object else "",
                last_seen=e.last_timestamp.isoformat() if e.last_timestamp else "",
                age=str(e.last_timestamp) if e.last_timestamp else "",
                count=e.count or 1,
            ))

        results.sort(key=lambda x: x.last_seen, reverse=True)
        return results
    except Exception as e:
        logger.error("Failed to list events: %s", e)
        raise HTTPException(status_code=500, detail=str(e))
