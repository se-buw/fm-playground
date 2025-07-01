import concurrent.futures
import glob
import os
import queue
import shutil
import subprocess
import tempfile

from dotenv import load_dotenv

load_dotenv()

SPECTRA_PATH = "lib/spectra-cli.jar"
MAX_CONCURRENT_REQUESTS = 10
TIMEOUT = os.environ.get("SPECTRA_TIMEOUT", 60)
executor = concurrent.futures.ThreadPoolExecutor(max_workers=MAX_CONCURRENT_REQUESTS)
code_queue = queue.Queue()


def run_spectra(code: str, check: str) -> str:
    """Run the given code in the Spectra CLI using the specified command.

    Args:
    code (str): The code to be executed in the Spectra CLI.
    check (str): The command to run. This can be one of the following:
      - 'check-realizability': Check if the specification is realizable.
      - 'concrete-controller': Synthesize a controller based on the specification.
      - 'concrete-counter-strategy': Generate a counter-strategy if the specification is not realizable.
      - 'unrealizable-core': Identify the unrealizable core of the specification.
      - 'check-well-sep': Verify if the specification is well-separated.
      - 'non-well-sep-core': Identify the non-well-separated core of the specification.

    Returns:
      str: The output of the command if successful, otherwise an error or timeout message.
    """
    tmp_file = tempfile.NamedTemporaryFile(mode="w", delete=False, suffix=".spectra")
    tmp_file.write(code.strip().replace("\r\n", "\n"))
    tmp_file.close()
    ## ==== Copy pattern files to the temp directory ====
    tmp_dir = os.path.dirname(tmp_file.name)
    pattern_files = glob.glob("lib/patterns/*")
    for file in pattern_files:
        dest = os.path.join(tmp_dir, os.path.basename(file))
        if not os.path.exists(dest):
            shutil.copy(file, tmp_dir)
    ## ==== Run the spectra commands ====
    if check == "check-realizability":
        command = [
            "java",
            "-Djava.library.path=./lib",
            "-jar",
            SPECTRA_PATH,
            "-a",
            "check-realizability",
            "-i",
            tmp_file.name,
        ]
    elif check == "concrete-controller":
        command = [
            "java",
            "-Djava.library.path=./lib",
            "-jar",
            SPECTRA_PATH,
            "-a",
            "concrete-controller",
            "-i",
            tmp_file.name,
        ]
    elif check == "concrete-counter-strategy":
        command = [
            "java",
            "-Djava.library.path=./lib",
            "-jar",
            SPECTRA_PATH,
            "-a",
            "concrete-counter-strategy",
            "-i",
            tmp_file.name,
        ]
    elif check == "unrealizable-core":
        command = [
            "java",
            "-Djava.library.path=./lib",
            "-jar",
            SPECTRA_PATH,
            "-a",
            "unrealizable-core",
            "-i",
            tmp_file.name,
        ]
    elif check == "check-well-sep":
        command = [
            "java",
            "-Djava.library.path=./lib",
            "-jar",
            SPECTRA_PATH,
            "-a",
            "check-well-sep",
            "-i",
            tmp_file.name,
        ]
    elif check == "non-well-sep-core":
        command = [
            "java",
            "-Djava.library.path=./lib",
            "-jar",
            SPECTRA_PATH,
            "-a",
            "non-well-sep-core",
            "-i",
            tmp_file.name,
        ]
    try:
        result = subprocess.run(
            command, capture_output=True, text=True, timeout=float(TIMEOUT)
        )
        os.remove(tmp_file.name)
        if result.returncode != 0:
            return prettify_error(result.stderr)
        return prettify_output(result.stdout) + prettify_error(result.stderr)
    except subprocess.TimeoutExpired:
        os.remove(tmp_file.name)
        return f"<i style='color: red;'>Timeout: Process timed out after {TIMEOUT} seconds.</i>"


def prettify_output(stdout: str):
    if "Result:" in stdout:
        res = stdout.split("Result: ")[1:]
        output = ""
        for r in res:
            output += f"Result: {r}\n"
        return output
    elif "Error:" in stdout:
        res = stdout.split("Error: ")[1:]
        output = ""
        for r in res:
            output += f"Error: {r}\n"
        return f"<i style='color: red;'>{output}\n</i>"


def prettify_error(stderr: str):
    return f"<i style='color: red;'>{stderr}</i>"


def process_commands(code: str, check: str):
    """Process the given code and command using the Spectra CLI. The code and command are added to the code_queue and processed by the executor. The executor runs the run_spectra function with the given code and command.
    This utilize the ThreadPoolExecutor to run the run_spectra function concurrently. The code_queue is used to store the code and command to be processed by the executor.

    Args:
      code (str): The code to be executed in the Spectra CLI.
      check (str): The command to run. This can be one of the following:
        - 'check-realizability': Check if the specification is realizable.
        - 'concrete-controller': Synthesize a controller based on the specification.
        - 'concrete-counter-strategy': Generate a counter-strategy if the specification is not realizable.
        - 'unrealizable-core': Identify the unrealizable core of the specification.
        - 'check-well-sep': Verify if the specification is well-separated.
        - 'non-well-sep-core': Identify the non-well-separated core of the specification.

    Returns:
      str: The output of the command if successful, otherwise an error or timeout message.
    """
    code_queue.put({"code": code, "check": check})
    while True:
        code_command = code_queue.get()
        if code_queue is None:
            break
        ex = executor.submit(run_spectra, code_command["code"], code_command["check"])
        return ex.result()
