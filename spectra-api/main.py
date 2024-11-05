import os
import requests
from typing import Union
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()
from spectra import process_commands

import redis
from redis_cache import RedisCache

API_URL = os.getenv("API_URL")
REDIS_URL = os.getenv("REDIS_URL")

client = redis.Redis.from_url(REDIS_URL)
cache = RedisCache(redis_client=client)

SPECTRA_CLI_COMMANDS = [
    "check-realizability",
    "concrete-controller",
    "concrete-counter-strategy",
    "unrealizable-core",
    "check-well-sep",
    "non-well-sep-core",
]

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
        if check == "SPECTRA":
            url = f"{API_URL}api/permalink/?check={check}&p={p}"
            res = requests.get(url)
            code = res.json().get("code")
            return code
    except Exception:
        raise HTTPException(status_code=404, detail="Permalink not found")


def run_spectra(code: str, command: str) -> str:
    if is_redis_available():

        @cache.cache()
        def cached_run_spectra(code: str, command: str) -> str:
            return process_commands(code, command)

        try:
            return cached_run_spectra(code, command)
        except Exception:
            raise HTTPException(
                status_code=500,
                detail="Something went wrong while executing the spectra cli.",
            )
    else:
        try:
            return process_commands(code, command)
        except Exception:
            raise HTTPException(
                status_code=500,
                detail="Something went wrong while executing the spectra cli.",
            )


@app.get("/spectra/run/", response_model=None)
def code(check: str, p: str, command: str):
    if command not in SPECTRA_CLI_COMMANDS:
        raise HTTPException(status_code=422, detail="Invalid command")
    try:
        code = get_code_by_permalink(check, p)
    except Exception:
        raise HTTPException(status_code=404, detail="Permalink not found")

    try:
        return run_spectra(code, command)
    except Exception:
        raise HTTPException(status_code=500, detail="Error running code")
