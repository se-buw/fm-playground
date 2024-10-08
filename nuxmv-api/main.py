import os
import requests
from typing import Union
from fastapi import FastAPI, HTTPException
from dotenv import load_dotenv
load_dotenv()
from nuxmv import process_commands
from fmp_redis.cache_decorator import fmp_redis_cache

API_URL = os.getenv("API_URL")
REDIS_URL = os.getenv("REDIS_URL")

app = FastAPI()

@fmp_redis_cache(REDIS_URL)
def run_nuxmv(code: str) -> str:
  try:
    return process_commands(code)
  except:
    raise HTTPException(status_code=500, detail="Error running code")


def get_code_by_permalink(check: str, p: str) -> Union[str, None]:
  try:
    if check.upper() == "XMV":
      url = f"{API_URL}api/permalink/?check={check}&p={p}"
      res = requests.get(url)
      code = res.json().get("code")
      return code
  except:
    raise HTTPException(status_code=404, detail="Permalink not found")



@app.get("/xmv/run/", response_model=None)
def code(check: str, p: str):
  try:
    code = get_code_by_permalink(check, p)
  except:
    raise HTTPException(status_code=404, detail="Permalink not found")
  try:
    return run_nuxmv(code)
  except:
    raise HTTPException(status_code=500, detail="Error running code")
