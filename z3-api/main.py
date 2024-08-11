import os
import requests
from typing import Union
from fastapi import FastAPI, HTTPException
from dotenv import load_dotenv
load_dotenv()
from z3.z3 import process_commands

API_URL = os.getenv("API_URL")
REDIS_URL = os.getenv("REDIS_URL")
if REDIS_URL:
  from z3.redis_cache import get_cache, set_cache


app = FastAPI()

def get_code_by_permalink(check: str, p: str) -> Union[str, None]:
  try:
    check = check.upper()
    if check == "SMT":
      url = f"{API_URL}api/permalink/?check={check}&p={p}"
      res = requests.get(url)
      code = res.json().get("code")
      return code
  except:
    raise HTTPException(status_code=404, detail="Permalink not found")

def run_z3(code: str) -> str:
  try:
    return process_commands(code)
  except:
    raise HTTPException(status_code=500, detail="Error running code")


@app.get("/smt/run/", response_model=None)
def code(check: str, p: str):
  try:
    code = get_code_by_permalink(check, p)
  except:
    raise HTTPException(status_code=404, detail="Permalink not found")
  try:
    if REDIS_URL:
      cached_result = get_cache(code)
      if cached_result is not None:
        return cached_result
      result = run_z3(code)
      set_cache(code, result)
      return result
    else:
      return run_z3(code)
  except:
    raise HTTPException(status_code=500, detail="Error running code")
