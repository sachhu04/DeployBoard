import subprocess
import threading
import os
import shutil
from typing import Dict, Any, Optional

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

def start_pipeline(app_name: str, repo_url: str):
    """Starts the CI/CD pipeline in a background thread."""
    if app_name in build_statuses and build_statuses[app_name]["status"] not in ["completed", "failed"]:
        raise ValueError(f"Build for {app_name} is already in progress.")
        
    build_statuses[app_name] = {"status": "pending", "logs": [], "error": False}
    thread = threading.Thread(target=_pipeline_worker, args=(app_name, repo_url))
    thread.daemon = True
    thread.start()

def get_status(app_name: str) -> Dict[str, Any]:
    return build_statuses.get(app_name, {"status": "not_found", "logs": [], "error": False})
