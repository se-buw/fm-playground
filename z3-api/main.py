import os
import requests
from typing import Union
from fastapi import FastAPI, HTTPException
from dotenv import load_dotenv

load_dotenv()
from z3 import process_commands
import redis
from redis_cache import RedisCache

API_URL = os.getenv("API_URL")
REDIS_URL = os.getenv("REDIS_URL")
client = redis.Redis.from_url(REDIS_URL)
cache = RedisCache(redis_client=client)

app = FastAPI()


def is_redis_available() -> bool:
    try:
        client.ping()
        return True
    except redis.ConnectionError:
        return False


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
    if is_redis_available():

        def cached_run_z3(code: str) -> str:
            return process_commands(code)

        try:
            return cached_run_z3(code)
        except:
            raise HTTPException(status_code=500, detail="Error running z3")
    else:
        try:
            return process_commands(code)
        except:
            raise HTTPException(status_code=500, detail="Error running z3")


@app.get("/smt/run/", response_model=None)
def code(check: str, p: str):
    code = get_code_by_permalink(check, p)
    try:
        return run_z3(code)
    except:
        raise HTTPException(status_code=500, detail="Error running code")
