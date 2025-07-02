import os
from typing import Union

import redis
import requests
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from limboole import run_limboole
from redis_cache import RedisCache

load_dotenv()


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
        if check == "SAT":
            url = f"{API_URL}api/permalink/?check={check}&p={p}"
            res = requests.get(url)
            code = res.json().get("code")
            return code
    except Exception:
        raise HTTPException(status_code=404, detail="Permalink not found")


def run(code: str, check_sat: bool) -> str:
    if is_redis_available():

        @cache.cache()
        def cached_run_limboole(code: str, check_sat) -> str:
            return run_limboole(code, check_sat)

        try:
            return cached_run_limboole(code, check_sat)
        except Exception:
            raise HTTPException(status_code=500, detail="Error running limboole")
    else:
        print("Redis not available, running limboole without cache")
        try:
            return run_limboole(code, check_sat)
        except Exception:
            raise HTTPException(status_code=500, detail="Error running limboole")


@app.get("/sat/run/", response_model=None)
def code(check: str, p: str, check_sat: bool):
    if not check or not p:
        raise HTTPException(status_code=400, detail="Invalid query parameters")
    code = get_code_by_permalink(check, p)
    try:
        return run(code, check_sat)
    except Exception:
        raise HTTPException(status_code=500, detail="Error running code")
