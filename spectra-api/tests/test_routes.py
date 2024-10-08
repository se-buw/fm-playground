from fastapi.testclient import TestClient
from spectra import TIMEOUT

def test_run_spectra_not_found(client: TestClient):
  response = client.get("/spectra/run/?check=SPECTRA&p=not-found&command=check-realizability")
  assert response.status_code == 404
  assert response.json() == {"detail": "Permalink not found"}

def test_invalid_route(client: TestClient):
  response = client.get("/spectra/run/?check=SMT&p=1")
  assert response.status_code == 422

def test_run_spectra_success_ex1(client: TestClient):
  response = client.get("/spectra/run/?check=SPECTRA&p=aside-humped-random-very&command=check-realizability")
  assert response.status_code == 200
  assert "Specification is realizable" in response.text

def test_run_spectra_success_timeout(client: TestClient):
  TIMEOUT = 1
  response = client.get("/spectra/run/?check=SPECTRA&p=aside-humped-random-very&command=check-realizability")
  assert response.status_code == 200
