from dotenv import load_dotenv
load_dotenv()
import os

username = os.getenv('DB_USERNAME', 'postgres')
password = os.getenv('DB_PASSWORD', 'postgres')
host = os.getenv('DB_HOST', 'postgres')
port = os.getenv('DB_PORT', '5432')
database = os.getenv('DB_NAME', 'postgres')
flask_env = os.getenv('FLASK_ENV')
class Config:
  DEBUG = True
  print(f"FLASK_ENV: {flask_env}")
  SQLALCHEMY_DATABASE_URI = "postgresql://postgres:postgres@localhost:5432/postgres"
  if flask_env == 'production':
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = f"postgresql://{username}:{password}@{host}:{port}/{database}"
  CACHE_TYPE = 'simple'
  SESSION_COOKIE_NAME = 'fm_playground_session'
  SESSION_COOKIE_PATH = '/'
  PERMANENT_SESSION_LIFETIME = 24*3600
  SESSION_COOKIE_SECURE = True
  SESSION_COOKIE_SAMESITE = None
