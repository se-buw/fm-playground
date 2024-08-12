import os
import requests
from typing import Union
from fastapi import FastAPI, HTTPException
from dotenv import load_dotenv
load_dotenv()
from spectra.spectra import process_commands

API_URL = os.getenv("API_URL")
REDIS_URL = os.getenv("REDIS_URL")
if REDIS_URL:
  from spectra.redis_cache import get_cache, set_cache

SPECTRA_CLI_COMMANDS = [
    'check-realizability', 
    'concrete-controller', 
    'concrete-counter-strategy', 
    'unrealizable-core', 
    'check-well-sep', 
    'non-well-sep-core'
  ]

app = FastAPI()

def get_code_by_permalink(check: str, p: str) -> Union[str, None]:
  try:
    check = check.upper()
    if check == "SPECTRA":
      url = f"{API_URL}api/permalink/?check={check}&p={p}"
      res = requests.get(url)
      code = res.json().get("code")
      return code
  except:
    raise HTTPException(status_code=404, detail="Permalink not found")

def run_spectra(code: str, command: str) -> str:
  try:
    return process_commands(code, command)
  except:
    raise HTTPException(status_code=500, detail="Something went wrong while executing the spectra cli.")


# FIXME: Upde with the command parameter
@app.get("/spectra/run/", response_model=None)
def code(check: str, p: str, command: str):
  if command not in SPECTRA_CLI_COMMANDS:
    raise HTTPException(status_code=400, detail="Invalid command")
  try:
    code = get_code_by_permalink(check, p)
  except:
    raise HTTPException(status_code=404, detail="Permalink not found")
  try:
    if REDIS_URL:
      cached_result = get_cache(code)
      if cached_result is not None:
        return cached_result
      result = run_spectra(code, command)
      set_cache(code, result)
      return result
    else:
      return run_spectra(code)
  except:
    raise HTTPException(status_code=500, detail="Error running code")
