from dotenv import load_dotenv
load_dotenv()
import os

username = os.getenv('DB_USERNAME')
password = os.getenv('DB_PASSWORD')
host = os.getenv('DB_HOST')
port = os.getenv('DB_PORT')
database = os.getenv('DB_NAME')
app_secret = os.getenv('APP_SECKET_KEY')
flask_env = os.getenv('FLASK_ENV')
class Config:
  DEBUG = True
  print(f"FLASK_ENV: {flask_env}")
  SQLALCHEMY_DATABASE_URI = "postgresql://postgres:postgres@localhost:5432/postgres"
  if flask_env == 'production':
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = f"postgresql://{username}:{password}@{host}:{port}/{database}"
  CACHE_TYPE = 'simple'
  SESSION_TYPE = 'filesystem'
  SECRET_KEY = app_secret
  SESSION_PERMANENT = True
  PERMANENT_SESSION_LIFETIME = 3600  # Example: 1 hour
