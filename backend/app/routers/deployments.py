"""Deployments router — list, scale, restart, rollback, YAML."""

from __future__ import annotations

import logging
from typing import Optional

import yaml
from fastapi import APIRouter, HTTPException, Query

from app.k8s.client import get_kube_client
from app.k8s.mock_data import mock_deployment_yaml, mock_deployments
from app.models.schemas import ActionResponse, ApplyYamlRequest, DeploymentResponse, ScaleRequest

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/deployments", tags=["deployments"])


@router.get("", response_model=list[DeploymentResponse])
def list_deployments(namespace: Optional[str] = Query(None)):
    kube = get_kube_client()

    if kube.is_mock:
        return mock_deployments(namespace)

    try:
        if namespace and namespace != "all":
            deps = kube.apps_v1.list_namespaced_deployment(namespace)
        else:
            deps = kube.apps_v1.list_deployment_for_all_namespaces()

        results = []
        for d in deps.items:
            status_obj = getattr(d, "status", None)
            spec_obj = getattr(d, "spec", None)
            
            ready = (status_obj.ready_replicas or 0) if status_obj else 0
            desired = (spec_obj.replicas or 0) if spec_obj else 0
            age_delta = d.metadata.creation_timestamp
            
            containers = spec_obj.template.spec.containers if spec_obj and spec_obj.template and spec_obj.template.spec else []
            image = containers[0].image if containers else "unknown"

            results.append(DeploymentResponse(
                name=d.metadata.name,
                namespace=d.metadata.namespace,
                ready_replicas=ready,
                desired_replicas=desired,
                status="Available" if ready == desired and desired > 0 else "Progressing" if desired > 0 else "Terminating",
                image=image,
                age=str(age_delta),
                created_at=age_delta.isoformat() if age_delta else "",
            ))
        return results
    except Exception as e:
        logger.error("Failed to list deployments: %s", e)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{name}/scale", response_model=ActionResponse)
def scale_deployment(
    name: str,
    body: ScaleRequest,
    namespace: str = Query("default"),
):
    kube = get_kube_client()
    kubectl_cmd = f"kubectl scale deployment {name} --replicas={body.replicas} -n {namespace}"
    explanation = (
        f"Scales the deployment '{name}' to {body.replicas} replica(s). "
        f"Kubernetes will create or terminate pods to match the desired count."
    )

    if kube.is_mock:
        return ActionResponse(
            success=True,
            message=f"Scaled {name} to {body.replicas} replicas (mock)",
            kubectl_command=kubectl_cmd,
            explanation=explanation,
        )

    try:
        kube.apps_v1.patch_namespaced_deployment_scale(
            name, namespace, {"spec": {"replicas": body.replicas}}
        )
        return ActionResponse(
            success=True,
            message=f"Scaled {name} to {body.replicas} replicas",
            kubectl_command=kubectl_cmd,
            explanation=explanation,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{name}/restart", response_model=ActionResponse)
def restart_deployment(name: str, namespace: str = Query("default")):
    kube = get_kube_client()
    kubectl_cmd = f"kubectl rollout restart deployment {name} -n {namespace}"
    explanation = (
        f"Triggers a rolling restart of deployment '{name}'. Kubernetes will "
        f"create new pods with a fresh start and gradually terminate old ones."
    )

    if kube.is_mock:
        return ActionResponse(
            success=True,
            message=f"Restarted deployment {name} (mock)",
            kubectl_command=kubectl_cmd,
            explanation=explanation,
        )

    try:
        from datetime import datetime, timezone

        now = datetime.now(timezone.utc).isoformat()
        body = {
            "spec": {
                "template": {
                    "metadata": {
                        "annotations": {"kubectl.kubernetes.io/restartedAt": now}
                    }
                }
            }
        }
        kube.apps_v1.patch_namespaced_deployment(name, namespace, body)
        return ActionResponse(
            success=True,
            message=f"Restarted deployment {name}",
            kubectl_command=kubectl_cmd,
            explanation=explanation,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{name}/rollback", response_model=ActionResponse)
def rollback_deployment(name: str, namespace: str = Query("default")):
    kube = get_kube_client()
    kubectl_cmd = f"kubectl rollout undo deployment {name} -n {namespace}"
    explanation = (
        f"Rolls back deployment '{name}' to the previous revision. "
        f"Kubernetes will switch to the last known-good ReplicaSet."
    )

    if kube.is_mock:
        return ActionResponse(
            success=True,
            message=f"Rolled back deployment {name} (mock)",
            kubectl_command=kubectl_cmd,
            explanation=explanation,
        )

    try:
        # The K8s Python client doesn't have a direct rollback method for apps/v1.
        # We patch the deployment to trigger a rollback by reverting the template.
        dep = kube.apps_v1.read_namespaced_deployment(name, namespace)
        rs_list = kube.apps_v1.list_namespaced_replica_set(
            namespace, label_selector=f"app={name}"
        )
        if len(rs_list.items) < 2:
            raise HTTPException(status_code=400, detail="No previous revision found")

        sorted_rs = sorted(
            rs_list.items,
            key=lambda rs: rs.metadata.annotations.get(
                "deployment.kubernetes.io/revision", "0"
            ),
            reverse=True,
        )
        previous_rs = sorted_rs[1]
        dep.spec.template = previous_rs.spec.template
        kube.apps_v1.replace_namespaced_deployment(name, namespace, dep)

        return ActionResponse(
            success=True,
            message=f"Rolled back deployment {name}",
            kubectl_command=kubectl_cmd,
            explanation=explanation,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{name}/yaml")
def get_deployment_yaml(name: str, namespace: str = Query("default")):
    kube = get_kube_client()

    if kube.is_mock:
        return {"yaml": mock_deployment_yaml(name, namespace)}

    try:
        import subprocess
        process = subprocess.run(
            ["kubectl", "get", "deployment", name, "-n", namespace, "-o", "yaml"],
            capture_output=True,
            text=True
        )
        if process.returncode != 0:
            raise HTTPException(status_code=500, detail=process.stderr)
            
        return {"yaml": process.stdout}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{name}/yaml", response_model=ActionResponse)
def apply_deployment_yaml(
    name: str,
    body: ApplyYamlRequest,
    namespace: str = Query("default"),
):
    kube = get_kube_client()
    kubectl_cmd = "kubectl apply -f deployment.yaml"
    explanation = (
        f"Applies the provided YAML configuration to the deployment '{name}'. "
        f"Kubernetes will calculate the difference and update the resource."
    )

    if kube.is_mock:
        return ActionResponse(
            success=True,
            message=f"Applied YAML configuration for {name} (mock)",
            kubectl_command=kubectl_cmd,
            explanation=explanation,
        )

    try:
        # Load YAML just to validate it's valid YAML and matches the name
        try:
            dep_dict = yaml.safe_load(body.yaml_content)
        except yaml.YAMLError as exc:
            raise HTTPException(status_code=400, detail=f"Invalid YAML: {exc}")
            
        if dep_dict.get("metadata", {}).get("name") != name:
            raise HTTPException(status_code=400, detail="Deployment name in YAML does not match URL")

        # Use kubectl apply directly for robust 3-way merge patching
        import subprocess
        process = subprocess.run(
            ["kubectl", "apply", "-n", namespace, "-f", "-"],
            input=body.yaml_content.encode("utf-8"),
            capture_output=True
        )
        
        if process.returncode != 0:
            raise HTTPException(status_code=500, detail=process.stderr.decode("utf-8"))

        return ActionResponse(
            success=True,
            message=f"Applied YAML configuration for {name}\\n{process.stdout.decode('utf-8').strip()}",
            kubectl_command=kubectl_cmd,
            explanation=explanation,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{name}", response_model=ActionResponse)
def delete_deployment(name: str, namespace: str = Query("default")):
    kube = get_kube_client()
    kubectl_cmd = f"kubectl delete deployment {name} -n {namespace}"
    explanation = f"Deletes the deployment '{name}' and all its associated pods."

    if kube.is_mock:
        return ActionResponse(
            success=True,
            message=f"Deleted {name} (mock)",
            kubectl_command=kubectl_cmd,
            explanation=explanation,
        )

    try:
        kube.apps_v1.delete_namespaced_deployment(name, namespace)
        return ActionResponse(
            success=True,
            message=f"Deleted deployment {name}",
            kubectl_command=kubectl_cmd,
            explanation=explanation,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
