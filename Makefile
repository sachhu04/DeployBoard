.PHONY: help dev build up down cluster cluster-down demo-deploy clean

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# --- Local Development (No Docker) ---

dev: ## Run frontend and backend locally (requires npm and python)
	@echo "Setting up Python 3.12 virtual environment..."
	cd backend && python3.12 -m venv venv && source venv/bin/activate && pip install -r requirements.txt
	@echo "Starting backend..."
	cd backend && source venv/bin/activate && uvicorn app.main:app --reload --port 8000 & \
	echo "Starting frontend..." && \
	cd frontend && npm run dev

# --- Docker Compose ---

build: ## Build docker images
	docker-compose build

up: ## Start DeployBoard with docker-compose
	docker-compose up -d
	@echo "DeployBoard running at http://localhost:3000"

down: ## Stop DeployBoard
	docker-compose down

# --- Kubernetes Cluster (Kind) ---

cluster: ## Create a local Kind cluster
	kind create cluster --name deployboard
	@echo "Cluster created. Context set to kind-deployboard."

cluster-down: ## Delete the local Kind cluster
	kind delete cluster --name deployboard

demo-deploy: ## Deploy sample workloads to the cluster
	kubectl apply -f k8s/demo.yaml
	@echo "Demo application deployed to 'demo-app' namespace."

clean: down cluster-down ## Remove docker containers and kind cluster
