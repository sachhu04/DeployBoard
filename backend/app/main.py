"""
DeployBoard API — FastAPI application entry point.

Provides REST endpoints and WebSocket streaming for Kubernetes cluster
management with automatic mock fallback for development.
"""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.k8s.client import get_kube_client
from app.routers import configmaps, deployments, events, logs, namespaces, pods, secrets, services, exec, metrics, ci

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize K8s client on startup."""
    kube = get_kube_client()
    mode = "MOCK" if kube.is_mock else "LIVE"
    logger.info("DeployBoard API started in %s mode", mode)
    yield
    logger.info("DeployBoard API shutting down")


app = FastAPI(
    title="DeployBoard API",
    description="Kubernetes management API with educational kubectl hints",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://127.0.0.1:3000",
        "https://deployboard.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(deployments.router)
app.include_router(pods.router)
app.include_router(services.router)
app.include_router(namespaces.router)
app.include_router(events.router)
app.include_router(logs.router)
app.include_router(configmaps.router)
app.include_router(secrets.router)
app.include_router(exec.router)
app.include_router(metrics.router)
app.include_router(ci.router)


@app.get("/api/health")
async def health_check():
    kube = get_kube_client()
    return {
        "status": "healthy",
        "mode": "mock" if kube.is_mock else "live",
        "version": "1.0.0",
    }
