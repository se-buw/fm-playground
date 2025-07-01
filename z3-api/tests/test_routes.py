from fastapi.testclient import TestClient


def test_run_z3_not_found(client: TestClient):
    response = client.get("/smt/run/?check=SMT&p=1")
    assert response.status_code == 404
    assert response.json() == {"detail": "Permalink not found"}


def test_run_z3_success_ex1(client: TestClient):
    response = client.get("/smt/run/?check=SMT&p=example-1")
    assert response.status_code == 200
    assert "sat" in response.text


def test_run_z3_success_timeout(client: TestClient):
    response = client.get("/smt/run/?check=SMT&p=hefty-unsaid-doze-gong")
    assert response.status_code == 200
    assert "Process timed out after" in response.text
