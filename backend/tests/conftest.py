import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, patch

from app.main import app
from app.k8s.client import KubeClient

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture
def mock_kube_client():
    mock_client = MagicMock(spec=KubeClient)
    mock_client.is_mock = False
    
    # We patch get_kube_client directly
    with patch("app.routers.deployments.get_kube_client", return_value=mock_client), \
         patch("app.routers.pods.get_kube_client", return_value=mock_client), \
         patch("app.routers.exec.get_kube_client", return_value=mock_client), \
         patch("app.routers.configmaps.get_kube_client", return_value=mock_client), \
         patch("app.routers.secrets.get_kube_client", return_value=mock_client), \
         patch("app.routers.services.get_kube_client", return_value=mock_client), \
         patch("app.routers.namespaces.get_kube_client", return_value=mock_client), \
         patch("app.routers.events.get_kube_client", return_value=mock_client), \
         patch("app.routers.metrics.get_kube_client", return_value=mock_client), \
         patch("app.routers.logs.get_kube_client", return_value=mock_client):
        yield mock_client
