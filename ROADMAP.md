# DeployBoard Roadmap

## Current Version: v1.0.0 (The Simulation Engine)
**Status:** Stable / Released
DeployBoard currently runs as a cloud-hosted operations dashboard using a highly realistic **Mock State Engine**. 
- **Frontend:** Hosted on Vercel
- **Backend:** Hosted on Render
- **Database/Cluster:** In-memory Mock State simulating Kubernetes ReplicaSets, Deployments, and Pods.
- **Goal Achieved:** Provides a zero-cost, instantly accessible portfolio demonstration of Kubernetes management without the overhead of cloud infrastructure.

---

## Future Major Release: v2.0.0 (The True Cloud-Native Platform)
**Status:** Planned 
The goal of v2.0 is to replace the Mock Engine with a real, cloud-hosted Kubernetes cluster capable of actually cloning, building, and deploying live applications from GitHub over the internet.

### Proposed Architecture (The "Split Cloud" approach)
Because free-tier serverless platforms (like Render) do not grant access to the underlying Docker daemon required to build images, the backend must be migrated to a dedicated Virtual Machine.

1. **Frontend (Vercel):** Remains on Vercel for fast, global, Edge-network delivery.
2. **Backend & Cluster (GCP Compute Engine):**
   - **Infrastructure:** A single `e2-medium` (2 vCPU, 4GB RAM) VM on Google Cloud.
   - **Cluster:** Minikube or k3s installed directly on the VM.
   - **Backend:** The FastAPI service runs natively on the VM, possessing local access to the `docker` and `kubectl` binaries.

### The CI/CD Workflow in v2.0
1. User submits a GitHub URL on the Vercel frontend.
2. Vercel sends a webhook to the FastAPI backend on the GCP VM.
3. The backend runs `git clone` onto the VM's local filesystem.
4. The backend runs `docker build` using the VM's native Docker daemon.
5. The backend runs `minikube image load` to push the image directly into the cluster cache.
6. The backend runs `kubectl apply` to launch the pods.

### DevOps Requirements & Blockers to Solve
To make this architecture function securely over the internet, the following DevOps pipelines must be established:

- **SSL & Mixed Content Policy:** Vercel (HTTPS) cannot communicate with a raw VM IP (HTTP). We must configure a dynamic DNS (e.g., DuckDNS) and install **Nginx + Let's Encrypt** on the VM to act as a reverse proxy to FastAPI.
- **WebSocket Routing:** Nginx must be configured to upgrade connections to allow the real-time CI/CD terminal logs to stream back to the Vercel frontend.
- **Dynamic Ingress (Optional but recommended):** If users want to actually *visit* the apps they deploy, an Nginx Ingress Controller must be installed inside Minikube to route dynamic subdomains (e.g., `app-name.yourdomain.com`) to the correct internal ClusterIP services.
