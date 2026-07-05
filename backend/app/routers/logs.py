"""WebSocket log streaming endpoint."""

from __future__ import annotations

import asyncio
import logging
import threading

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.k8s.client import get_kube_client
from app.k8s.mock_data import mock_log_line

logger = logging.getLogger(__name__)
router = APIRouter(tags=["logs"])


@router.websocket("/ws/logs/{namespace}/{pod_name}")
async def stream_pod_logs(
    websocket: WebSocket,
    namespace: str,
    pod_name: str,
    container: str | None = None,
):
    await websocket.accept()
    kube = get_kube_client()

    if kube.is_mock:
        # Stream simulated log lines for demo purposes
        try:
            while True:
                line = mock_log_line()
                await websocket.send_text(line)
                await asyncio.sleep(0.3 + (asyncio.get_event_loop().time() % 0.7))
        except WebSocketDisconnect:
            logger.debug("Client disconnected from mock log stream")
        except Exception as e:
            logger.error("Mock log stream error: %s", e)
        return

    try:
        kwargs = {
            "name": pod_name,
            "namespace": namespace,
            "follow": True,
            "tail_lines": 100,
            "_preload_content": False,
        }
        if container:
            kwargs["container"] = container

        log_stream = kube.core_v1.read_namespaced_pod_log(**kwargs)

        q = asyncio.Queue()
        loop = asyncio.get_running_loop()

        def read_sync():
            try:
                for line in log_stream.stream():
                    decoded = line.decode("utf-8").rstrip("\n")
                    if decoded:
                        loop.call_soon_threadsafe(q.put_nowait, decoded)
            except Exception as exc:
                logger.debug("Sync read thread ended: %s", exc)
            finally:
                loop.call_soon_threadsafe(q.put_nowait, None)

        thread = threading.Thread(target=read_sync, daemon=True)
        thread.start()

        while True:
            line = await q.get()
            if line is None:
                break
            await websocket.send_text(line)

    except WebSocketDisconnect:
        logger.debug("Client disconnected from log stream for %s/%s", namespace, pod_name)
    except Exception as e:
        logger.error("Log stream error for %s/%s: %s", namespace, pod_name, e)
        try:
            await websocket.send_text(f"ERROR: {str(e)}")
        except Exception:
            pass
    finally:
        try:
            await websocket.close()
        except Exception:
            pass
