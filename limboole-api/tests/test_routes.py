from fastapi.testclient import TestClient

def test_run_limboole_not_found(client: TestClient):
  response = client.get("/sat/run/?check=SAT&p=1")
  assert response.status_code == 404
  assert response.json() == {"detail": "Permalink not found"}

def test_run_limboole_success_ex1(client: TestClient):
  response = client.get("/sat/run/?check=SAT&p=example-1")
  assert response.status_code == 200
  assert "sat" in response.text

def test_run_limboole_success_timeout(client: TestClient):
  response = client.get("/sat/run/?check=SAT&p=hefty-unsaid-doze-gong")
  assert response.status_code == 200
  assert "Process timed out after" in response.text
