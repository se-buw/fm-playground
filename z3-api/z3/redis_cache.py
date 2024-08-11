import os
import redis
import hashlib
from dotenv import load_dotenv

load_dotenv()

REDIS_URL = os.getenv("REDIS_URL")
CACHE_TTL = os.getenv("CACHE_TTL", 3600)
redis_client = redis.Redis.from_url(REDIS_URL)

def generate_cache_key(code: str) -> str:
  """Generate a unique cache key for the code."""
  return hashlib.md5(code.encode()).hexdigest()

def get_cache(code: str) -> str:
  """Retrieve the cached result if it exists."""
  key = generate_cache_key(code)
  cached_result = redis_client.get(key)
  return cached_result

def set_cache(code: str, result: str) -> None:
  """Cache the result with a unique key."""
  key = generate_cache_key(code)
  redis_client.set(key, result, ex=CACHE_TTL)
