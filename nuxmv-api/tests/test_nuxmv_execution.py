import concurrent.futures
import subprocess
from unittest import mock

from nuxmv import MAX_CONCURRENT_REQUESTS, prettify_error, process_commands, run_nuxmv

train_valid_spec = """MODULE main
    VAR
      carsGo : boolean;
      trainComing : boolean;
      trainsGo : boolean;
    TRANS -- trains signal
      trainComing -> next(trainsGo);
    TRANS -- one or the other go
      carsGo = ! trainsGo;
    LTLSPEC
      G F trainComing -> G F trainsGo;
    LTLSPEC
      G F carsGo;"""

train_parse_error = """MDULE main
    VAR
      carsGo : boolean;
      trainComing : boolean;
      trainsGo : boolean;"""


def test_train_success():
    result = run_nuxmv(train_valid_spec)
    assert "<i style='color: red;'></i>" in result  # No error
    assert (
        "-- specification ( G ( F trainComing) ->  G ( F trainsGo))  is true"
        in result  # First LTL spec is true
    )
    assert (
        "-- specification  G ( F carsGo)  is false" in result
    )  # Second LTL spec is false


def test_train_parse_error():
    result = run_nuxmv(train_parse_error)
    assert "<i style='color: red;'>" in result
    assert "line 1: Parser error" in result


# Test case to check error handling in run_nuxmv
def test_run_nuxmv_error():
    code = train_parse_error
    expected_error = "Error: some error message"

    with mock.patch("subprocess.run") as mock_run, mock.patch(
        "os.remove"
    ) as mock_remove:
        mock_run.return_value = mock.Mock(
            returncode=1, stdout="", stderr=expected_error
        )

        result = run_nuxmv(code)
        assert result == prettify_error(expected_error)

        mock_run.assert_called_once()
        mock_remove.assert_called_once()


# Test case to check timeout handling in run_nuxmv
def test_run_nuxmv_timeout():
    code = "MODULE main\nVAR\n  x: boolean;\nINIT\n  x = TRUE;"

    with mock.patch(
        "subprocess.run", side_effect=subprocess.TimeoutExpired(cmd="nuXmv", timeout=60)
    ) as mock_run, mock.patch("os.remove") as mock_remove:
        result = run_nuxmv(code)
        assert (
            result
            == "<i style='color: red;'>Timeout: Process timed out after 60 seconds.</i>"
        )
        mock_run.assert_called_once()
        mock_remove.assert_called_once()


def test_max_concurrent_processes():
    # Mock run_nuxmv to simulate processing without delay
    def mock_run_nuxmv(code):
        return f"Processed {code}"

    # Create a list to track the order of task execution
    processed_tasks = []
    with mock.patch(
        "nuxmv.nuxmv.run_nuxmv", side_effect=mock_run_nuxmv
    ) as mock_run, mock.patch("nuxmv.nuxmv.executor") as mock_executor, mock.patch(
        "nuxmv.nuxmv.code_queue"
    ) as mock_queue:

        def mock_submit(fn, *args):
            future = concurrent.futures.Future()
            future.set_result(fn(*args))
            processed_tasks.append(args[0])
            return future

        mock_executor.submit.side_effect = mock_submit
        mock_queue.get.side_effect = lambda: (
            processed_tasks.pop(0) if processed_tasks else None
        )

        num_tasks = 11
        for i in range(num_tasks):
            code = train_valid_spec
            process_commands(code)

        # Ensure that the correct number of tasks have been processed
        assert mock_run.call_count == num_tasks
        # Check that the executor's submit method was called for each task
        assert mock_executor.submit.call_count == num_tasks
        # Ensure no more than MAX_CONCURRENT_REQUESTS tasks were handled concurrently
        assert len(processed_tasks) <= MAX_CONCURRENT_REQUESTS
