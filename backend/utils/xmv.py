import os
import subprocess
import tempfile
import re
import queue
import concurrent.futures
import threading
import time

import platform

NU_XMV_PATH = platform.system() == "Windows" and r'nuXmv\nuXmv-2.0.0-win64\bin\nuXmv.exe' or r'nuXmv/nuXmv-2.0.0-Linux/bin/nuXmv'

MAX_CONCURRENT_REQUESTS = 10 # Maximum number of concurrent subprocesses

executor = concurrent.futures.ThreadPoolExecutor(max_workers=MAX_CONCURRENT_REQUESTS) #thread pool with a maximum of max_concurrent threads

code_queue = queue.Queue() # to hold incoming commands



def run_nuxmv(code: str):
  tmp_file = tempfile.NamedTemporaryFile(mode='w', delete=False)
  tmp_file.write(code.strip())  
  tmp_file.close()
  print(tmp_file.name)

  command = [NU_XMV_PATH, "-dynamic", tmp_file.name] # TODO: Check dynamic ordering
  try:
    result = subprocess.run(command, capture_output=True, text=True, timeout=5)
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
  #print(res)
  return '\n'.join(res_clean[:-3])


def process_commands(code: str):
  code_queue.put(code)
  while True:
    code_command = code_queue.get()
    if code_queue is None:
      break
    ex = executor.submit(run_nuxmv, code_command)
    return ex.result()


# incoming_processor_thread = threading.Thread(target=process_commands)
# incoming_processor_thread.start()




# # filename = "nuXmv\crossing1.smv"
# output = run_nuxmv("""MODULE main

# VAR
#   carsGo : boolean;
#   trainComing : boolean;
#   trainsGo : boolean;
  
# TRsANS -- trains signal
#   trainComing -> next(trainsGo);
# TRANS -- one or the other go
#   carsGo = ! trainsGo;  

# LTLSPEC
#   G F trainComing -> G F trainsGo;

# LTLSPEC
#   G F carsGo;
#   """)
# print("Standard output of the process:")
# print(stdout)
# print("Standard Error of the process:")
# print(stderr)