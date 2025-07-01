import os
from typing import Union

import requests
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()
import redis
from redis_cache import RedisCache
from z3 import process_commands

API_URL = os.getenv("API_URL")
REDIS_URL = os.getenv("REDIS_URL")
client = redis.Redis.from_url(REDIS_URL)
cache = RedisCache(redis_client=client)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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
    except Exception:
        raise HTTPException(status_code=404, detail="Permalink not found")


def run_z3(code: str) -> str:
    if is_redis_available():

        @cache.cache()
        def cached_run_z3(code: str) -> str:
            return process_commands(code)

        try:
            return cached_run_z3(code)
        except Exception:
            raise HTTPException(status_code=500, detail="Error running z3")
    else:
        try:
            return process_commands(code)
        except Exception:
            raise HTTPException(status_code=500, detail="Error running z3")


@app.get("/smt/run/", response_model=None)
def code(check: str, p: str):
    code = get_code_by_permalink(check, p)
    try:
        return run_z3(code)
    except Exception:
        raise HTTPException(status_code=500, detail="Error running code")
