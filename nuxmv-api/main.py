from typing import Union

from fastapi import FastAPI, HTTPException
import requests
from nuxmv.nuxmv import process_commands

app = FastAPI()

API_URL = "http://localhost:8000/"


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
    raise HTTPException(status_code=404, detail="Error running code")

@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/xmv/run/", response_model=None)
def code(check: str, p: str):
  try:
    code = get_code_by_permalink(check, p)
    try:
      return run_nuxmv(code)
    except:
      raise HTTPException(status_code=500, detail="Error running code")
  except:
    raise HTTPException(status_code=404, detail="Permalink not found")
