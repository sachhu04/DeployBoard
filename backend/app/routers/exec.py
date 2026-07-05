from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import logging
import asyncio
from kubernetes.stream import stream

from app.k8s.client import get_kube_client

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/ws/exec", tags=["exec"])

@router.websocket("/{namespace}/{pod}")
async def exec_shell(websocket: WebSocket, namespace: str, pod: str):
    await websocket.accept()
    kube = get_kube_client()
    
    if kube.is_mock:
        # Mock mode fallback
        welcome_msg = f"\r\n\033[1;32mConnected to pod {pod} in namespace {namespace} (MOCK MODE)\033[0m\r\n"
        await websocket.send_text(welcome_msg)
        prompt = f"\033[1;36mroot@{pod}\033[0m:\033[1;34m/app\033[0m# "
        await websocket.send_text(prompt)
        try:
            while True:
                data = await websocket.receive_text()
                if data.strip() == "ls":
                    await websocket.send_text("\r\napp.py  requirements.txt  config.json\r\n")
                elif data.strip() == "pwd":
                    await websocket.send_text("\r\n/app\r\n")
                elif data.strip() == "whoami":
                    await websocket.send_text("\r\nroot\r\n")
                elif data.strip() == "clear":
                    await websocket.send_text("\033[2J\033[3J\033[H")
                elif data.strip() == "exit":
                    await websocket.send_text("\r\nexit\r\n")
                    await websocket.close()
                    break
                elif data.strip() == "":
                    await websocket.send_text("\r\n")
                else:
                    await websocket.send_text(f"\r\nbash: {data.strip()}: command not found\r\n")
                await websocket.send_text(prompt)
        except WebSocketDisconnect:
            pass
        return

    # Real Kubernetes Exec
    exec_command = [
        "/bin/sh",
        "-c",
        "TERM=xterm-256color; export TERM; [ -x /bin/bash ] && ([ -x /usr/bin/script ] && /usr/bin/script -q -c \"/bin/bash\" /dev/null || exec /bin/bash) || exec /bin/sh"
    ]
    
    try:
        resp = stream(
            kube.core_v1.connect_get_namespaced_pod_exec,
            pod,
            namespace,
            command=exec_command,
            stderr=True, stdin=True,
            stdout=True, tty=True,
            _preload_content=False
        )

        async def read_from_ws():
            try:
                while True:
                    data = await websocket.receive_text()
                    resp.write_stdin(data)
            except WebSocketDisconnect:
                pass
            except Exception as e:
                logger.error(f"Error reading from WS: {e}")

        # Spawn task to read from browser and write to k8s
        ws_task = asyncio.create_task(read_from_ws())

        # Loop to read from k8s and write to browser
        while resp.is_open():
            resp.update(timeout=0)
            
            if resp.peek_stdout():
                out = resp.read_stdout()
                await websocket.send_text(out)
                
            if resp.peek_stderr():
                err = resp.read_stderr()
                await websocket.send_text(err)
                
            await asyncio.sleep(0.01)

        # Once closed by K8s
        ws_task.cancel()
        await websocket.close()

    except WebSocketDisconnect:
        logger.info(f"Exec WebSocket disconnected for pod {pod}")
    except Exception as e:
        logger.error(f"Exec WebSocket error: {e}")
        try:
            await websocket.close()
        except:
            pass
