import pytest
from fastapi.testclient import TestClient
from app.main import app
from unittest.mock import patch, MagicMock

def test_ci_pipeline(client):
    with patch("app.routers.ci.start_pipeline") as mock_start:
        # Test missing param
        response = client.post("/api/ci/deploy", json={"app_name": "", "repo_url": ""})
        assert response.status_code == 400
        
        # Test value error
        mock_start.side_effect = ValueError("Invalid")
        response = client.post("/api/ci/deploy", json={"app_name": "test-app", "repo_url": "https://github.com"})
        assert response.status_code == 400
        
        # Test generic error
        mock_start.side_effect = Exception("Failed")
        response = client.post("/api/ci/deploy", json={"app_name": "test-app", "repo_url": "https://github.com"})
        assert response.status_code == 500
        
        # Test success
        mock_start.side_effect = None
        response = client.post("/api/ci/deploy", json={"app_name": "test-app", "repo_url": "https://github.com"})
        assert response.status_code == 200
        assert "started" in response.json()["message"]
        mock_start.assert_called_with("test-app", "https://github.com")

def test_ci_status(client):
    from app.ci.builder import build_statuses
    build_statuses["test-app"] = {"status": "building", "message": "Compiling", "logs": []}
    
    response = client.get("/api/ci/status/test-app")
    assert response.status_code == 200
    assert response.json()["status"] == "building"
    
    response = client.get("/api/ci/status/unknown")
    assert response.status_code == 404

def test_ci_builder_success():
    from app.ci.builder import _pipeline_worker, build_statuses
    build_statuses.clear()
    
    with patch("subprocess.Popen") as mock_popen, patch("os.walk") as mock_walk, patch("os.path.exists") as mock_exists:
        mock_process = MagicMock()
        mock_process.stdout.readline.side_effect = ["Cloning...", ""]
        mock_process.returncode = 0
        mock_popen.return_value = mock_process
        
        mock_walk.return_value = [("/tmp/test-app", [], ["Dockerfile"])]
        mock_exists.return_value = False
        
        _pipeline_worker("test-app", "https://github.com/test/test.git")
        
        assert build_statuses["test-app"]["status"] == "completed"

def test_ci_builder_failure():
    from app.ci.builder import _pipeline_worker, build_statuses
    build_statuses.clear()
    
    with patch("subprocess.Popen") as mock_popen:
        mock_process = MagicMock()
        mock_process.returncode = 1
        mock_process.stdout.readline.side_effect = ["error\n", ""]
        mock_popen.return_value = mock_process
        
        try:
            _pipeline_worker("test-app", "https://github.com/test/test.git")
        except Exception:
            pass
        
        assert build_statuses["test-app"]["status"] == "failed"
