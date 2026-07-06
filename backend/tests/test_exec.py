import pytest
from fastapi.testclient import TestClient
from starlette.websockets import WebSocketDisconnect
from app.main import app

def test_exec_websocket_mock(mock_kube_client):
    mock_kube_client.is_mock = True
    client = TestClient(app)
    try:
        with client.websocket_connect("/ws/exec/default/test-pod") as websocket:
            # We expect a prompt first
            data = websocket.receive_text()
            assert "test-pod" in data
            
            # test prompt
            data = websocket.receive_text()
            assert "root" in data
            
            websocket.send_text("ls\n")
            data2 = websocket.receive_text()
            assert "app.py" in data2
            
            # test pwd
            websocket.receive_text() # prompt
            websocket.send_text("pwd\n")
            data = websocket.receive_text()
            assert "/app" in data
            
            # test clear
            websocket.receive_text() # prompt
            websocket.send_text("clear\n")
            data = websocket.receive_text()
            assert "\033[2J" in data
            
            # test unknown
            websocket.receive_text() # prompt
            websocket.send_text("unknown\n")
            data = websocket.receive_text()
            assert "command not found" in data
            
            # test exit
            websocket.receive_text() # prompt
            websocket.send_text("exit\n")
            data = websocket.receive_text()
            assert "exit" in data
            
    except WebSocketDisconnect:
        pass

def test_exec_websocket_real(mock_kube_client):
    from unittest.mock import patch
    mock_kube_client.is_mock = False
    
    with patch("app.routers.exec.stream") as mock_stream:
        # We need mock_stream to return an object with write, read_stdout, read_stderr, is_open
        from unittest.mock import MagicMock
        mock_ws = MagicMock()
        mock_ws.is_open.side_effect = [True, True, False]
        mock_ws.read_stdout.side_effect = ["output1\\n", ""]
        mock_ws.read_stderr.return_value = ""
        mock_stream.return_value = mock_ws
        
        client = TestClient(app)
        try:
            with client.websocket_connect("/ws/exec/default/test-pod") as websocket:
                data = websocket.receive_text()
                assert "Connected to pod" in data
                
                # Should receive output1
                data = websocket.receive_text()
                assert "output1" in data
                
                # Send a command
                websocket.send_text("echo test")
        except WebSocketDisconnect:
            pass
