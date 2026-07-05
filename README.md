# DeployBoard

DeployBoard is a self-hosted Platform-as-a-Service (PaaS) and Kubernetes dashboard designed for rapid application deployment, real-time observability, and infrastructure management. It abstracts the complexity of Kubernetes while providing deep, live integration with the underlying cluster.

## Architecture

DeployBoard consists of a decoupled frontend and backend, communicating over REST and WebSockets for real-time data streaming.

1.  **Frontend (Next.js / React)**
    *   **Framework:** Next.js 16 with App Router.
    *   **Styling:** Tailwind CSS, Framer Motion for micro-interactions, and Shadcn UI components.
    *   **State Management:** React Query (TanStack Query) for API caching and mutation handling.
    *   **Terminal Integration:** xterm.js for the interactive shell environment.
2.  **Backend (FastAPI / Python)**
    *   **Framework:** FastAPI for high-performance, asynchronous REST endpoints.
    *   **Kubernetes Integration:** Official Python Kubernetes Client (`kubernetes-client`).
    *   **Concurrency:** `asyncio` for WebSocket streams, integrated with ThreadPoolExecutors for blocking Kubernetes streaming APIs.
    *   **CI/CD Engine:** A custom background daemon that interfaces with the local Docker daemon and `kind` (Kubernetes in Docker) to seamlessly build and inject images.

## Features

*   **Real-time Kubernetes Telemetry:** Live streaming of Pods, Deployments, Services, ConfigMaps, and Secrets.
*   **Interactive Terminal:** A fully interactive, web-based bash shell into any running Pod using WebSockets (`kubectl exec`).
*   **Live Log Streaming:** Real-time stdout/stderr streaming from containers using WebSockets (`kubectl logs -f`).
*   **CI/CD Pipeline:** One-click deployment from any public GitHub repository. Automatically clones, locates the Dockerfile, builds the image, loads it into the cluster, and provisions the Deployment and Service network layers.
*   **Resource Management:** Instantly scale deployments up or down, trigger rolling restarts, or rollback to previous revisions with automated error handling.
*   **YAML Editor:** View and manually apply raw Kubernetes YAML configurations directly from the browser.

## Prerequisites

Ensure the following dependencies are installed and running on your host machine:

*   Node.js (v18+)
*   Python (3.12+)
*   Docker Desktop (or equivalent Docker daemon)
*   `kind` (Kubernetes in Docker)
*   `kubectl`
*   `make`

## Local Setup

1.  **Provision the Local Cluster**
    Create a local Kubernetes cluster using `kind` and install the Metrics Server for resource tracking:
    ```bash
    make cluster
    ```

2.  **Start the Development Servers**
    Start both the FastAPI backend and the Next.js frontend concurrently:
    ```bash
    make dev
    ```

3.  **Access the Dashboard**
    Navigate to `http://localhost:3000` in your web browser.

## CI/CD Pipeline Details

The custom CI/CD engine operates entirely within the host environment, bypassing the need for an external container registry during local development. When a deployment is triggered:

1.  The repository is cloned to a temporary directory.
2.  A recursive search identifies the location of the `Dockerfile` to establish the correct build context.
3.  The Docker daemon builds the image locally.
4.  The image is side-loaded directly into the `kind` cluster's nodes via `kind load docker-image`.
5.  Kubernetes manifests (Deployment and Service) are generated and applied via the Kubernetes API.
