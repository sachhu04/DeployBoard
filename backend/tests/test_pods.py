def test_list_pods_success(client, mock_kube_client):
    from kubernetes.client.models.v1_pod_list import V1PodList
    from kubernetes.client.models.v1_pod import V1Pod
    from kubernetes.client.models.v1_object_meta import V1ObjectMeta
    from kubernetes.client.models.v1_pod_status import V1PodStatus
    from kubernetes.client.models.v1_pod_spec import V1PodSpec
    from datetime import datetime

    mock_pod = V1Pod(
        metadata=V1ObjectMeta(name="test-pod", namespace="default", creation_timestamp=datetime.now()),
        spec=V1PodSpec(node_name="test-node", containers=[]),
        status=V1PodStatus(phase="Running", host_ip="10.0.0.1", pod_ip="10.0.0.2")
    )
    mock_pod_list = V1PodList(items=[mock_pod])
    
    # Test without selector
    mock_kube_client.core_v1.list_namespaced_pod.return_value = mock_pod_list
    response = client.get("/api/pods?namespace=default")
    assert response.status_code == 200
    assert len(response.json()) == 1

def test_delete_pod_success(client, mock_kube_client):
    response = client.delete("/api/pods/test-pod?namespace=default")
    assert response.status_code == 200
    assert response.json()["message"] == "Pod test-pod has been deleted and will be recreated if managed by a deployment."
    mock_kube_client.core_v1.delete_namespaced_pod.assert_called_once()
