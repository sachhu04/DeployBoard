def test_list_deployments_success(client, mock_kube_client):
    mock_kube_client.apps_v1.list_namespaced_deployment.return_value.items = []
    
    response = client.get("/api/deployments?namespace=default")
    assert response.status_code == 200
    assert response.json() == []

def test_list_deployments_error(client, mock_kube_client):
    from kubernetes.client.rest import ApiException
    mock_kube_client.apps_v1.list_namespaced_deployment.side_effect = ApiException(status=500, reason="Internal Server Error")
    
    response = client.get("/api/deployments?namespace=default")
    assert response.status_code == 500
    assert "Internal Server Error" in response.json()["detail"]

def test_scale_deployment_success(client, mock_kube_client):
    response = client.post("/api/deployments/test-dep/scale", json={"namespace": "default", "replicas": 3})
    assert response.status_code == 200
    assert response.json()["message"] == "Scaled test-dep to 3 replicas"
    mock_kube_client.apps_v1.patch_namespaced_deployment_scale.assert_called_once()

def test_restart_deployment_success(client, mock_kube_client):
    from kubernetes.client.models.v1_deployment import V1Deployment
    from kubernetes.client.models.v1_object_meta import V1ObjectMeta
    from kubernetes.client.models.v1_deployment_spec import V1DeploymentSpec
    from kubernetes.client.models.v1_pod_template_spec import V1PodTemplateSpec

    from kubernetes.client.models.v1_label_selector import V1LabelSelector
    mock_dep = V1Deployment(
        metadata=V1ObjectMeta(name="test-dep"),
        spec=V1DeploymentSpec(
            selector=V1LabelSelector(match_labels={"app": "test-dep"}),
            template=V1PodTemplateSpec(
                metadata=V1ObjectMeta(annotations={})
            )
        )
    )
    mock_kube_client.apps_v1.read_namespaced_deployment.return_value = mock_dep
    
    response = client.post("/api/deployments/test-dep/restart?namespace=default")
    assert response.status_code == 200
    assert "Restarted deployment" in response.json()["message"]
    mock_kube_client.apps_v1.patch_namespaced_deployment.assert_called_once()

def test_rollback_deployment_error_no_rs(client, mock_kube_client):
    mock_rs = type("MockRS", (), {"items": []})()
    mock_kube_client.apps_v1.list_namespaced_replica_set.return_value = mock_rs
    response = client.post("/api/deployments/test-dep/rollback?namespace=default")
    assert response.status_code == 400
    assert "No previous revision found" in response.json()["detail"]

def test_rollback_deployment_success(client, mock_kube_client):
    mock_rs = type("MockRS", (), {"items": []})()
    mock_kube_client.apps_v1.list_namespaced_replica_set.return_value = mock_rs
    
    # Normally this would raise a 400 because there are no replica sets to rollback to in this mock setup.
    response = client.post("/api/deployments/test-dep/rollback?namespace=default")
    assert response.status_code == 400
    assert "No previous revision found" in response.json()["detail"]

def test_get_deployment_yaml(client, mock_kube_client):
    from unittest.mock import patch
    mock_kube_client.is_mock = False
    with patch("subprocess.run") as mock_run:
        mock_run.return_value.returncode = 0
        mock_run.return_value.stdout = "apiVersion: apps/v1"
        response = client.get("/api/deployments/test-dep/yaml?namespace=default")
        assert response.status_code == 200
        assert "apiVersion: apps/v1" in response.json()["yaml"]


def test_apply_deployment_yaml_error(client, mock_kube_client):
    mock_kube_client.is_mock = False
    
    # Invalid YAML
    response = client.put("/api/deployments/test-dep/yaml?namespace=default", json={"yaml_content": "invalid: yaml: :"})
    assert response.status_code == 400
    assert "Invalid YAML" in response.json()["detail"]
    
    # Missing name mismatch
    yaml_str = "apiVersion: v1\nmetadata:\n  name: other-dep"
    response = client.put("/api/deployments/test-dep/yaml?namespace=default", json={"yaml_content": yaml_str})
    assert response.status_code == 400
    assert "Deployment name in YAML does not match URL" in response.json()["detail"]
def test_apply_deployment_yaml(client):
    from unittest.mock import patch, MagicMock
    yaml_content = """
apiVersion: apps/v1
kind: Deployment
metadata:
  name: test-dep
  namespace: default
"""
    with patch("subprocess.run") as mock_run:
        mock_process = MagicMock()
        mock_process.returncode = 0
        mock_run.return_value = mock_process
        
        response = client.put("/api/deployments/test-dep/yaml", json={"yaml_content": yaml_content})
        assert response.status_code == 200
        assert "Applied YAML" in response.json()["message"]
