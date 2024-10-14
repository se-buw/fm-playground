from unittest import mock
import concurrent.futures
from limboole import run_limboole

valid_spec = """a & b"""


def test_train_success():
    result = run_limboole(valid_spec)
    assert "unsat" in result  
    assert " model is not available" in result 

