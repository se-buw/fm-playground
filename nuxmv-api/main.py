import os
import requests
from typing import Union
from fastapi import FastAPI, HTTPException
from dotenv import load_dotenv
load_dotenv()
from nuxmv.nuxmv import process_commands

API_URL = os.getenv("API_URL")
REDIS_URL = os.getenv("REDIS_URL")
if REDIS_URL:
  from nuxmv.redis_cache import get_cache, set_cache


app = FastAPI()

def get_code_by_permalink(check: str, p: str) -> Union[str, None]:
  try:
    check = check.upper()
    if check == "XMV":
      url = f"{API_URL}api/permalink/?check={check}&p={p}"
      res = requests.get(url)
      code = res.json().get("code")
      return code
  except:
    raise HTTPException(status_code=404, detail="Permalink not found")

def run_nuxmv(code: str) -> str:
  try:
    return process_commands(code)
  except:
    raise HTTPException(status_code=500, detail="Error running code")

@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/xmv/run/", response_model=None)
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
      result = run_nuxmv(code)
      set_cache(code, result)
      return result
    else:
      return run_nuxmv(code)
  except:
    raise HTTPException(status_code=500, detail="Error running code")
