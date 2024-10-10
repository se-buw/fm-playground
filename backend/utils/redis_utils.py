import os
from dotenv import load_dotenv
import redis
import json
import hashlib
load_dotenv()

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
redis_client = redis.Redis.from_url(REDIS_URL)

def generate_cache_key(*args, **kwargs) -> str:
  key = json.dumps({'args': args, 'kwargs': kwargs}, sort_keys=True)
  return hashlib.md5(key.encode()).hexdigest()

def set_cache(key: str, value: str) -> None:
  redis_client.set(key, value)

def get_cache(key: str) -> str:
  return redis_client.get(key)