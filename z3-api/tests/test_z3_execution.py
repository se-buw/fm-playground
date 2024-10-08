from unittest import mock
import concurrent.futures
from z3 import prettify_error, run_z3, process_commands, MAX_CONCURRENT_REQUESTS

valid_spec = """(declare-const a Int)
(declare-const b Int)
(assert (> a 1))
(assert (> b 1))
(assert (= (* a b) 17))
(check-sat)
(get-model)"""


def test_train_success():
    result = run_z3(valid_spec)
    assert "unsat" in result  
    assert " model is not available" in result 

