import subprocess
import threading
import os
import shutil
import time
import random
from typing import Dict, Any, Optional
from datetime import datetime, timezone
from app.k8s.client import get_kube_client
from app.k8s import mock_data

# Global dictionary to track build statuses
# In a real app, this would be in a database
build_statuses: Dict[str, Dict[str, Any]] = {}

def update_status(app_name: str, status: Optional[str], log_line: Optional[str] = None, error: bool = False):
    if app_name not in build_statuses:
        build_statuses[app_name] = {"status": "pending", "logs": [], "error": False}
    
    if status:
        build_statuses[app_name]["status"] = status
    if error:
        build_statuses[app_name]["error"] = True
    if log_line:
        build_statuses[app_name]["logs"].append(log_line)

def run_command(cmd: str, app_name: str, step_name: str):
    """Runs a shell command and streams output to the build status."""
    update_status(app_name, step_name, f"Running: {cmd}")
    process = subprocess.Popen(
        cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True
    )
    
    if process.stdout is not None:
        for line in iter(process.stdout.readline, ''):
            if line:
                update_status(app_name, None, line.strip())
            
    process.wait()
    if process.returncode != 0:
        update_status(app_name, "failed", f"Command failed with exit code {process.returncode}", error=True)
        raise Exception(f"Command failed: {cmd}")

def _pipeline_worker(app_name: str, repo_url: str):
    tmp_dir = f"/tmp/{app_name}"
    
    try:
        # 1. Cleanup old directory if exists
        if os.path.exists(tmp_dir):
            shutil.rmtree(tmp_dir)
            
        # 2. Clone
        run_command(f"git clone {repo_url} {tmp_dir}", app_name, "cloning")
        
        # 2.5 Find Dockerfile
        update_status(app_name, "building", "Locating Dockerfile...")
        dockerfile_path = None
        for root, dirs, files in os.walk(tmp_dir):
            if "Dockerfile" in files:
                dockerfile_path = os.path.join(root, "Dockerfile")
                break
                
        if not dockerfile_path:
            raise Exception("No Dockerfile found anywhere in the repository")
            
        build_context = os.path.dirname(dockerfile_path)
        update_status(app_name, None, f"Found Dockerfile at: {dockerfile_path}")
        
        # 3. Build Docker Image
        run_command(f"docker build -t {app_name}:latest -f {dockerfile_path} {build_context}", app_name, "building")
        
        # 4. Load into Kind cluster
        run_command(f"kind load docker-image {app_name}:latest --name deployboard", app_name, "loading")
        
        # 5. Generate and Apply Kubernetes YAML
        yaml_content = f"""
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {app_name}
  namespace: default
  labels:
    app: {app_name}
spec:
  replicas: 1
  selector:
    matchLabels:
      app: {app_name}
  template:
    metadata:
      labels:
        app: {app_name}
    spec:
      containers:
      - name: {app_name}
        image: {app_name}:latest
        imagePullPolicy: Never
        ports:
        - containerPort: 3000
---
apiVersion: v1
kind: Service
metadata:
  name: {app_name}-svc
  namespace: default
spec:
  selector:
    app: {app_name}
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
"""
        yaml_path = f"/tmp/{app_name}_k8s.yaml"
        with open(yaml_path, "w") as f:
            f.write(yaml_content)
            
        run_command(f"kubectl apply -f {yaml_path}", app_name, "deploying")
        
        update_status(app_name, "completed", "Successfully deployed to Kubernetes!")
        
    except Exception as e:
        update_status(app_name, "failed", str(e), error=True)

def _mock_pipeline_worker(app_name: str, repo_url: str):
    try:
        # Simulate cloning
        update_status(app_name, "cloning", f"Running: git clone {repo_url} /tmp/{app_name}")
        time.sleep(2)
        update_status(app_name, None, f"Cloning into '/tmp/{app_name}'...")
        update_status(app_name, None, "Receiving objects: 100% (235/235), 1.2MB | 4.34 MiB/s, done.")
        update_status(app_name, None, "Resolving deltas: 100% (45/45), done.")
        time.sleep(1)
        
        # Simulate building
        update_status(app_name, "building", "Locating Dockerfile...")
        time.sleep(1)
        update_status(app_name, None, "Found Dockerfile at: /tmp/app/Dockerfile")
        update_status(app_name, None, f"Running: docker build -t {app_name}:latest -f /tmp/app/Dockerfile /tmp/app")
        update_status(app_name, None, "Step 1/5 : FROM node:20-alpine")
        time.sleep(1)
        update_status(app_name, None, " ---> 3b8d14v8b1")
        update_status(app_name, None, "Step 2/5 : WORKDIR /app")
        time.sleep(1)
        update_status(app_name, None, " ---> 9f12c1c1f2")
        update_status(app_name, None, "Step 3/5 : COPY package.json .")
        time.sleep(0.5)
        update_status(app_name, None, " ---> 1b2e1f4d8a")
        update_status(app_name, None, "Step 4/5 : RUN npm install")
        time.sleep(2.5)
        update_status(app_name, None, "added 142 packages, and audited 143 packages in 2s")
        update_status(app_name, None, " ---> c9d8e7f6a5")
        update_status(app_name, None, "Step 5/5 : COPY . .")
        time.sleep(0.5)
        update_status(app_name, None, " ---> 4a3b2c1d0e")
        update_status(app_name, None, f"Successfully built {app_name}:latest")
        
        # Simulate pushing/loading
        update_status(app_name, "loading", f"Running: kind load docker-image {app_name}:latest --name deployboard")
        update_status(app_name, None, "Image: \"{app_name}:latest\" with ID \"sha256:4a3b2c1d0e\" not yet present on node \"deployboard-control-plane\", loading...")
        time.sleep(2)
        
        # Simulate deploying
        update_status(app_name, "deploying", f"Running: kubectl apply -f /tmp/{app_name}_k8s.yaml")
        time.sleep(1)
        update_status(app_name, None, f"deployment.apps/{app_name} created")
        update_status(app_name, None, f"service/{app_name}-svc created")
        
        # Inject into mock data
        mock_data._init_mock_state()
        now_iso = datetime.now(timezone.utc).isoformat()
        
        mock_data._MOCK_STATE["deployments"].insert(0, {
            "name": app_name,
            "namespace": "default",
            "ready_replicas": 1,
            "desired_replicas": 1,
            "status": "Available",
            "image": f"{app_name}:latest",
            "age": "1s",
            "created_at": now_iso,
        })
        
        mock_data._MOCK_STATE["pods"].insert(0, {
            "name": f"{app_name}-{''.join(random.choices('abcdef0123456789', k=5))}-{''.join(random.choices('abcdef0123456789', k=5))}",
            "namespace": "default",
            "status": "Running",
            "restarts": 0,
            "node": "kind-worker",
            "age": "1s",
            "created_at": now_iso,
            "ip": f"10.244.{random.randint(0, 3)}.{random.randint(2, 254)}",
            "deployment": app_name,
        })
        
        mock_data._MOCK_STATE["services"].insert(0, {
            "name": f"{app_name}-svc",
            "namespace": "default",
            "type": "ClusterIP",
            "cluster_ip": f"10.96.{random.randint(0, 255)}.{random.randint(1, 254)}",
            "port": 80,
            "target_port": 3000,
            "age": "1s",
        })
        
        update_status(app_name, "completed", "Successfully deployed to Mock Kubernetes!")
        
    except Exception as e:
        update_status(app_name, "failed", str(e), error=True)

def start_pipeline(app_name: str, repo_url: str):
    """Starts the CI/CD pipeline in a background thread."""
    if app_name in build_statuses and build_statuses[app_name]["status"] not in ["completed", "failed"]:
        raise ValueError(f"Build for {app_name} is already in progress.")
        
    build_statuses[app_name] = {"status": "pending", "logs": [], "error": False}
    
    kube = get_kube_client()
    if kube.is_mock:
        thread = threading.Thread(target=_mock_pipeline_worker, args=(app_name, repo_url))
    else:
        thread = threading.Thread(target=_pipeline_worker, args=(app_name, repo_url))
        
    thread.daemon = True
    thread.start()

def get_status(app_name: str) -> Dict[str, Any]:
    return build_statuses.get(app_name, {"status": "not_found", "logs": [], "error": False})
