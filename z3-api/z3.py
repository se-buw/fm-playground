import concurrent.futures
import os
import queue
import re
import subprocess
import tempfile

MAX_CONCURRENT_REQUESTS = 10
executor = concurrent.futures.ThreadPoolExecutor(max_workers=MAX_CONCURRENT_REQUESTS)
code_queue = queue.Queue()


def run_z3(code: str) -> str:
    """
    Run the code in z3 and return the output.

    Parameters:
      code (str): the code to run

    Returns:
      str: the output of the code if successful, otherwise the error or timeout message
    """
    tmp_file = tempfile.NamedTemporaryFile(mode="w", delete=False, suffix=".smt2")
    tmp_file.write(code.strip())
    tmp_file.close()
    command = ["z3", "-smt2", tmp_file.name]
    try:
        result = subprocess.run(command, capture_output=True, text=True, timeout=60)
        os.remove(tmp_file.name)
        return result.stdout
    except subprocess.TimeoutExpired:
        os.remove(tmp_file.name)
        return "Process timed out after {} seconds".format(5)


def prettify_output(stdout: str):
    res = [
        line
        for line in stdout.split("\n")
        if "***" not in line.lower() and line.strip()
    ]
    return "\n".join(res)


def prettify_error(stderr: str):
    pattern = r"^.*?:(?=\sline)"
    res = [re.sub(pattern, "error:", line) for line in stderr.split("\n")]
    res_clean = [item for item in res if item != ""]
    return "\n".join(res_clean[:-3])


def process_commands(code: str):
    code_queue.put(code)
    while True:
        code_command = code_queue.get()
        if code_queue is None:
            break
        ex = executor.submit(run_z3, code_command)
        return ex.result()
