import os
import re
import subprocess
import tempfile

LIMBOOLE_EXE = "lib/limbooleAPE.exe"


def run_limboole(code: str, check_sat: bool) -> str:
    tmp_file = tempfile.NamedTemporaryFile(mode="w", delete=False, suffix=".limboole")
    tmp_file.write(code)
    tmp_file.close()
    try:
        if check_sat:
            command = [LIMBOOLE_EXE, "-s", tmp_file.name]
        else:
            command = [LIMBOOLE_EXE, tmp_file.name]
        result = subprocess.run(command, capture_output=True, text=True, timeout=5)
        os.remove(tmp_file.name)
        if result.returncode != 0:
            return prettify_error(result.stderr)
        return result.stdout
    except subprocess.TimeoutExpired:
        os.remove(tmp_file.name)
        return "Timeout expired"


def prettify_error(stderr: str) -> str:
    modified_stderr = re.sub(r"^.*\.limboole:", "<stdin>:", stderr)
    return modified_stderr
