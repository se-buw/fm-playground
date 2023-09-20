import os

username = os.getenv('DB_USERNAME', 'postgres')
password = os.getenv('DB_PASSWORD', 'postgres')
host = os.getenv('DB_HOST', 'postgres')
port = os.getenv('DB_PORT', '5432')
database = os.getenv('DB_NAME', 'postgres')

class Config:
  DEBUG = True
  SQLALCHEMY_DATABASE_URI = f"postgresql://{username}:{password}@{host}:{port}/{database}"
  # SQLALCHEMY_DATABASE_URI = "postgresql://postgres:postgres@localhost:5432/postgres"
  CACHE_TYPE = 'simple'
  SESSION_COOKIE_NAME = 'fm_playground_session'
  SESSION_COOKIE_PATH = '/'
  PERMANENT_SESSION_LIFETIME = 24*3600
  SESSION_COOKIE_SECURE = True
  SESSION_COOKIE_SAMESITE = None
