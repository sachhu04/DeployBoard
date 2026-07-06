def test_list_configmaps(client, mock_kube_client):
    mock_kube_client.core_v1.list_namespaced_config_map.return_value.items = []
    
    response = client.get("/api/configmaps?namespace=default")
    assert response.status_code == 200
    assert response.json() == []

def test_list_secrets(client, mock_kube_client):
    mock_kube_client.core_v1.list_namespaced_secret.return_value.items = []
    
    response = client.get("/api/secrets?namespace=default")
    assert response.status_code == 200
    assert response.json() == []

def test_list_services(client, mock_kube_client):
    mock_kube_client.core_v1.list_namespaced_service.return_value.items = []
    
    response = client.get("/api/services?namespace=default")
    assert response.status_code == 200
    assert response.json() == []

def test_list_namespaces(client, mock_kube_client):
    mock_kube_client.core_v1.list_namespace.return_value.items = []
    
    response = client.get("/api/namespaces")
    assert response.status_code == 200
    assert response.json() == []

def test_list_events(client, mock_kube_client):
    mock_kube_client.core_v1.list_namespaced_event.return_value.items = []
    
    response = client.get("/api/events?namespace=default")
    assert response.status_code == 200
    assert response.json() == []

def test_routers_error_handling(client, mock_kube_client):
    from kubernetes.client.rest import ApiException
    error = ApiException(status=403, reason="Forbidden")
    
    mock_kube_client.core_v1.list_namespaced_config_map.side_effect = error
    response = client.get("/api/configmaps?namespace=default")
    assert response.status_code == 500
    
    mock_kube_client.core_v1.list_namespaced_secret.side_effect = error
    response = client.get("/api/secrets?namespace=default")
    assert response.status_code == 500
    
    mock_kube_client.core_v1.list_namespaced_service.side_effect = error
    response = client.get("/api/services?namespace=default")
    assert response.status_code == 500
    
    mock_kube_client.core_v1.list_namespace.side_effect = error
    response = client.get("/api/namespaces")
    assert response.status_code == 500
    
    mock_kube_client.core_v1.list_namespaced_event.side_effect = error
    response = client.get("/api/events?namespace=default")
    assert response.status_code == 500
