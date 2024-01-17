import os
import subprocess
import tempfile


def run_tool(code: str) -> str:
  """
  Run the code in nuXmv and return the output.
  
  Parameters:
    code (str): the code to run
  
  Returns: 
    str: the output of the code if successful, otherwise the error or timeout message
    
  """
  tmp_file = tempfile.NamedTemporaryFile(mode='w', delete=False)
  tmp_file.write(code.strip())  
  tmp_file.close()
  print(os.name)

  command = ["cmd.exe", "/c", "dir"] if os.name == 'nt' else ["ls", "-l"]

  try:
    result = subprocess.run(command, capture_output=True, text=True, timeout=60)
    os.remove(tmp_file.name)
    if result.returncode != 0:
      return result.stderr
    return result.stdout+ result.stderr
  except subprocess.TimeoutExpired:
    os.remove(tmp_file.name)
    return f"<i style='color: red;'>Timeout: Process timed out after 60 seconds.</i>"
  