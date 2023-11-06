import os
import subprocess
import tempfile
import re
import queue
import concurrent.futures

MAX_CONCURRENT_REQUESTS = 10 # Maximum number of concurrent subprocesses

executor = concurrent.futures.ThreadPoolExecutor(max_workers=MAX_CONCURRENT_REQUESTS) #thread pool with a maximum of max_concurrent threads

code_queue = queue.Queue() # to hold incoming commands


def run_z3(code: str):
  tmp_file = tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.smt2')
  tmp_file.write(code.strip())  
  tmp_file.close()
  print(tmp_file.name)
  command = ["z3", "-smt2", tmp_file.name] 
  try:
    result = subprocess.run(command, capture_output=True, text=True, timeout=5)
    os.remove(tmp_file.name)
    return result.stdout
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
    ex = executor.submit(run_z3, code_command)
    return ex.result()
