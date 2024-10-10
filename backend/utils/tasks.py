import os
import re
import subprocess
import platform
import tempfile

from config import app
from celery_app import celery_init_app
from utils.redis_utils import generate_cache_key, set_cache

celery = celery_init_app(app)

LIMBOOLE_EXE = platform.system() == "Windows" and r'lib/limboole/limboole.exe' or r'lib/limboole/limboole-linux-amd64.exe'

@celery.task
def run_limboole(code: str, check_sat: bool) -> str:
    key = generate_cache_key(code, check_sat)
    tmp_file = tempfile.NamedTemporaryFile(mode='w', delete=False, suffix=".limboole")
    tmp_file.write(code)  
    tmp_file.close() 
    try:
        if check_sat:
            command = [LIMBOOLE_EXE, '-s', tmp_file.name]
        else:
            command = [LIMBOOLE_EXE, tmp_file.name]
        result = subprocess.run(command, capture_output=True, text=True, timeout=5)
        os.remove(tmp_file.name)
        if result.returncode != 0:
            res = prettify_error(result.stderr)
            set_cache(key, res)
            return res
        res = result.stdout
        set_cache(key, res)
        print(res)
        return res
    except subprocess.TimeoutExpired:
        os.remove(tmp_file.name)
        app.logger.error(f"Timeout expired for Limboole task. | Payload: {code}")
        return "Timeout expired"

@celery.task
def run_z3(code: str) -> str:
    key = generate_cache_key(code)
    tmp_file = tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.smt2')
    tmp_file.write(code.strip())  
    tmp_file.close()
    try:
        command = ['z3', tmp_file.name]
        result = subprocess.run(command, capture_output=True, text=True, timeout=5)
        os.remove(tmp_file.name)
        res = result.stdout
        set_cache(key, res)
        return res
    except subprocess.TimeoutExpired:
        os.remove(tmp_file.name)
        app.logger.error(f"Timeout expired for Z3 task. | Payload: {code}")
        return "Timeout expired"

def prettify_error(stderr: str) -> str:
    modified_stderr = re.sub(r'^.*\.limboole:', '<stdin>:', stderr)
    return modified_stderr