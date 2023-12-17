import os
import subprocess
import tempfile
import re
import queue
import concurrent.futures

import platform

NU_XMV_PATH = platform.system() == "Windows" and r'nuXmv\nuXmv-2.0.0-win64\bin\nuXmv.exe' or r'nuXmv/nuXmv-2.0.0-Linux/bin/nuXmv'

MAX_CONCURRENT_REQUESTS = 10 # Maximum number of concurrent subprocesses

executor = concurrent.futures.ThreadPoolExecutor(max_workers=MAX_CONCURRENT_REQUESTS) #thread pool with a maximum of max_concurrent threads
code_queue = queue.Queue() # to hold incoming commands



def run_nuxmv(code: str) -> str:
  """
  Run the code in nuXmv and return the output.
  
  Parameters:
    code (str): the code to run
  
  Returns: 
    str: the output of the code if successful, otherwise the error or timeout message
    
  TODO (maybe): Logging the resource usage of the subprocess. Windows: psutil, Linux: resource.getrusage(resource.RUSAGE_CHILDREN)
  """
  tmp_file = tempfile.NamedTemporaryFile(mode='w', delete=False)
  tmp_file.write(code.strip())  
  tmp_file.close()

  command = [NU_XMV_PATH, "-dynamic", tmp_file.name] # TODO: Check dynamic ordering
  try:
    result = subprocess.run(command, capture_output=True, text=True, timeout=60)
    os.remove(tmp_file.name)
    if result.returncode != 0:
      return prettify_error(result.stderr)
    return prettify_output(result.stdout), prettify_error(result.stderr)
  except subprocess.TimeoutExpired:
    os.remove(tmp_file.name)
    return "Process timed out after {} seconds".format(5)


def prettify_output(stdout: str):
  res = [line for line in stdout.split('\n') if '***' not in line.lower() and line.strip()]
  return '\n'.join(res)

def prettify_error(stderr: str):
  pattern = r'^.*?:(?=\sline)'
  res = [re.sub(pattern, 'error:', line) for line in stderr.split('\n') ]
  res_clean = [item for item in res if item != '']
  return '\n'.join(res_clean[:-3])


def process_commands(code: str):
  code_queue.put(code)
  while True:
    code_command = code_queue.get()
    if code_queue is None:
      break
    ex = executor.submit(run_nuxmv, code_command)
    return ex.result()
