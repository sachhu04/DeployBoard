import time
import random
import logging
from typing import List, Dict, Any
from fastapi import APIRouter
from kubernetes import client

from app.k8s.client import get_kube_client

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/metrics", tags=["metrics"])

# Memory store for history
history_state = []
mock_state = {"cpu": 45.0, "memory": 60.0}

def parse_cpu(cpu_str: str) -> float:
    if cpu_str.endswith("n"):
        return int(cpu_str[:-1]) / 1_000_000_000
    if cpu_str.endswith("u"):
        return int(cpu_str[:-1]) / 1_000_000
    if cpu_str.endswith("m"):
        return int(cpu_str[:-1]) / 1000
    try:
        return float(cpu_str)
    except:
        return 0.0

def parse_mem(mem_str: str) -> float:
    if mem_str.endswith("Ki"):
        return int(mem_str[:-2]) * 1024
    if mem_str.endswith("Mi"):
        return int(mem_str[:-2]) * (1024**2)
    if mem_str.endswith("Gi"):
        return int(mem_str[:-2]) * (1024**3)
    try:
        return float(mem_str)
    except:
        return 0.0

def get_mock_metrics():
    mock_state["cpu"] = max(10.0, min(90.0, mock_state["cpu"] + random.uniform(-10.0, 10.0)))
    mock_state["memory"] = max(30.0, min(85.0, mock_state["memory"] + random.uniform(-5.0, 5.0)))
    
    now = int(time.time())
    history_state.append({
        "timestamp": now,
        "cpu": mock_state["cpu"],
        "memory": mock_state["memory"]
    })
    
    if len(history_state) > 20:
        history_state.pop(0)
        
    return {
        "current": {
            "cpu": round(mock_state["cpu"], 1),
            "memory": round(mock_state["memory"], 1)
        },
        "history": [
            {
                "time": time.strftime("%H:%M", time.localtime(p["timestamp"])),
                "cpu": round(p["cpu"], 1),
                "memory": round(p["memory"], 1)
            }
            for p in history_state
        ]
    }

@router.get("/cluster")
async def get_cluster_metrics():
    kube = get_kube_client()
    if kube.is_mock:
        return get_mock_metrics()

    try:
        custom_api = client.CustomObjectsApi(api_client=kube.core_v1.api_client)
        nodes_metrics = custom_api.list_cluster_custom_object("metrics.k8s.io", "v1beta1", "nodes")
        
        total_cpu_cores = 0.0
        total_mem_bytes = 0.0
        
        for item in nodes_metrics.get("items", []):
            usage = item.get("usage", {})
            total_cpu_cores += parse_cpu(usage.get("cpu", "0n"))
            total_mem_bytes += parse_mem(usage.get("memory", "0Ki"))
            
        # Get capacity
        node_list = kube.core_v1.list_node()
        cap_cpu_cores = 0.0
        cap_mem_bytes = 0.0
        
        for n in node_list.items:
            allocatable = n.status.allocatable
            cap_cpu_cores += parse_cpu(allocatable.get("cpu", "1"))
            cap_mem_bytes += parse_mem(allocatable.get("memory", "1Gi"))
            
        cpu_percent = (total_cpu_cores / cap_cpu_cores * 100) if cap_cpu_cores > 0 else 0
        mem_percent = (total_mem_bytes / cap_mem_bytes * 100) if cap_mem_bytes > 0 else 0
        
        now = int(time.time())
        history_state.append({
            "timestamp": now,
            "cpu": cpu_percent,
            "memory": mem_percent
        })
        
        if len(history_state) > 20:
            history_state.pop(0)
            
        return {
            "current": {
                "cpu": round(cpu_percent, 1),
                "memory": round(mem_percent, 1)
            },
            "history": [
                {
                    "time": time.strftime("%H:%M", time.localtime(p["timestamp"])),
                    "cpu": round(p["cpu"], 1),
                    "memory": round(p["memory"], 1)
                }
                for p in history_state
            ]
        }

    except Exception as e:
        logger.error(f"Failed to fetch real metrics: {e}")
        # Metrics server might still be starting, fallback to mock
        return get_mock_metrics()
