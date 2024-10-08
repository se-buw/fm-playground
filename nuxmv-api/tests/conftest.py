import pytest
from collections.abc import Generator

from fastapi import FastAPI
from fastapi.testclient import TestClient

from main import app


@pytest.fixture(scope="module")
def client() -> Generator[TestClient, None, None]:
  with TestClient(app) as c:
    yield c