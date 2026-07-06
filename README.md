# DeployBoard 🚀

DeployBoard is a modern, cloud-native Kubernetes management dashboard built for developers who want to manage, monitor, and deploy their workloads without living in the terminal.

It features a stunning "Electric Yellow" dark mode aesthetic, an embedded real-time CI/CD engine, and a suite of interactive tools to inspect and modify Kubernetes resources on the fly.

## ✨ Features

- **One-Click Management:** Scale, restart, rollback, or delete deployments and pods instantly. No more typing long `kubectl` commands.
- **Real-Time Observability:** Stream live pod logs with auto-scroll and view live CPU/Memory utilization graphs powered by real cluster metrics.
- **Interactive Web Terminal:** Pop open a native Web Socket terminal to `exec` directly into any pod's shell from your browser.
- **Live CI/CD Pipelines:** Trigger live deployments directly from a GitHub repository link. Watch the built-in engine clone, build, and deploy your code in real-time.
- **Live YAML Editing:** View, edit, and apply Kubernetes YAML configurations live using an embedded VS Code-style Monaco editor.
- **Learn kubectl:** Every action shows the exact underlying `kubectl` command and explains what it does, helping you build real Kubernetes skills.

## 🛠️ Tech Stack

- **Frontend:** Next.js, React, TailwindCSS, Framer Motion, Base UI, Recharts, Monaco Editor
- **Backend:** FastAPI (Python), Kubernetes Client, WebSockets, subprocess automation
- **Infrastructure:** Kubernetes (Kind), Docker

## 🚀 Getting Started

DeployBoard comes with a built-in `Makefile` to instantly spin up a local Kubernetes cluster and launch the application.

### Prerequisites
- Docker (must be running)
- `kind` (Kubernetes IN Docker)
- `kubectl`
- Node.js & npm
- Python 3.12+

### 1. Create the Local Cluster
Spin up the local `kind` cluster and install the necessary metrics server:
```bash
make cluster
```

### 2. Deploy the Demo Workloads
Seed the cluster with some sample applications to populate the dashboard:
```bash
make demo-deploy
```

### 3. Start DeployBoard
Launch the FastAPI backend and Next.js frontend concurrently:
```bash
make dev
```
Navigate to [http://localhost:3000](http://localhost:3000) to view the dashboard!

## 📸 Demo Flow

1. Open the **Deployments** tab to see live CPU/Memory usage.
2. Click the `...` on a deployment and hit **View YAML** to open the live editor.
3. Open the **Pods** tab and click the yellow Terminal icon to `exec` into a running container.
4. Click **Deploy from GitHub**, paste a public Next.js/React repository URL, and watch the pipeline build and inject the image straight into your cluster!

## 📝 License

MIT License
