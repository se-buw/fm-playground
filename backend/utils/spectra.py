import os
import subprocess
import tempfile
import queue
import concurrent.futures

SPECTRA_PATH = "lib/spectra-cli.jar"
MAX_CONCURRENT_REQUESTS = 10 # Maximum number of concurrent subprocesses

executor = concurrent.futures.ThreadPoolExecutor(max_workers=MAX_CONCURRENT_REQUESTS) #thread pool with a maximum of max_concurrent threads
code_queue = queue.Queue()

def run_spectra(code: str, check: str) -> str:
  """
  Run the code in spectra cli with the given command and return the output.
  
  Parameters:
    code (str): the code to run
    check (str): the command to run
      check_realizability, synthesize_controller, counter_strategy, ,unrealizable_core, check_well_separation, non_well_separated_core
  
  Returns: 
    str: the output of the code if successful, otherwise the error or timeout message
  """
  tmp_file = tempfile.NamedTemporaryFile(mode='w', delete=False, suffix=".spectra")
  tmp_file.write(code.strip())  
  tmp_file.close()
  print(tmp_file.name)

  # TODO: Add the check command to the spectra command after (re)-implementing the spectra cli
  # TODO: Configure CUDD and other dynamic options available in the spectra cli
  command = ['java', '-jar', SPECTRA_PATH, '-i', tmp_file.name, '--jtlv']
  try:
    result = subprocess.run(command, capture_output=True, text=True, timeout=60)
    os.remove(tmp_file.name)
    if result.returncode != 0:
      return prettify_error(result.stderr)
    return prettify_output(result.stdout)+ prettify_error(result.stderr)
  except subprocess.TimeoutExpired:
    os.remove(tmp_file.name)
    return f"<i style='color: red;'>Timeout: Process timed out after 60 seconds.</i>"
  
def prettify_output(stdout: str):
  if 'Result:' in stdout:
    res = stdout.split('Result:')[1].split('\n')
    return '\n'.join(res)
  elif 'Error:' in stdout:
    res = stdout.split('Error: ')[1].split('\n')
    res = '\n'.join(res)
    return f"<i style='color: red;'>{res}\n</i>"

def prettify_error(stderr: str):
  return f"<i style='color: red;'>{stderr}</i>"
  
def process_commands(code: str, check: str):
  code_queue.put({'code': code, 'check': check})
  while True:
    code_command = code_queue.get()
    if code_queue is None:
      break
    ex = executor.submit(run_spectra, code_command['code'], code_command['check'])
    return ex.result()
  
    