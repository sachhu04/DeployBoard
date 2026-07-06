from fastapi.testclient import TestClient
from starlette.websockets import WebSocketDisconnect
from app.main import app

def test_logs_websocket_disconnect(mock_kube_client):
    mock_kube_client.is_mock = True
    client = TestClient(app)
    try:
        with client.websocket_connect("/ws/logs/default/test-pod") as websocket:
            data = websocket.receive_text()
            assert len(data) > 0
            data2 = websocket.receive_text()
            assert len(data2) > 0
    except WebSocketDisconnect:
        pass

def test_logs_websocket_real(mock_kube_client):
    mock_kube_client.is_mock = False
    mock_kube_client.core_v1.read_namespaced_pod_log.return_value = ["line1\\n", "line2\\n"]
    
    client = TestClient(app)
    try:
        with client.websocket_connect("/ws/logs/default/test-pod") as websocket:
            data1 = websocket.receive_text()
            assert data1 == "line1\\r\\n"
            data2 = websocket.receive_text()
            assert data2 == "line2\\r\\n"
    except WebSocketDisconnect:
        pass

def test_logs_websocket_error(mock_kube_client):
    from kubernetes.client.rest import ApiException
    mock_kube_client.is_mock = False
    mock_kube_client.core_v1.read_namespaced_pod_log.side_effect = ApiException(status=404, reason="Not Found")
    
    client = TestClient(app)
    try:
        with client.websocket_connect("/ws/logs/default/test-pod") as websocket:
            data = websocket.receive_text()
            assert "ERROR: (404)" in data
    except WebSocketDisconnect:
        pass
