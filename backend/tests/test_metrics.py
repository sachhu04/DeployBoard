from app.routers.metrics import parse_cpu, parse_mem

def test_parse_cpu():
    assert parse_cpu("100m") == 0.1
    assert parse_cpu("1") == 1.0
    assert parse_cpu("500u") == 0.0005
    assert parse_cpu("500n") == 0.0000005
    assert parse_cpu("invalid") == 0.0

def test_parse_memory():
    assert parse_mem("100Ki") == 100 * 1024
    assert parse_mem("100Mi") == 100 * 1024 * 1024
    assert parse_mem("100Gi") == 100 * 1024 * 1024 * 1024
    assert parse_mem("invalid") == 0.0

def test_cluster_metrics(client, mock_kube_client):
    from app.routers.metrics import get_mock_metrics
    get_mock_metrics()
    
    mock_kube_client.core_v1.list_node.return_value.items = []
    response = client.get("/api/metrics/cluster")
    assert response.status_code == 200
