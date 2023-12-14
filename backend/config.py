import os
from dotenv import load_dotenv
from flask import Flask
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy
from flask_restful import Api
from flask_bcrypt import Bcrypt

load_dotenv()


app = Flask(__name__)

app.secret_key = os.getenv('APP_SECKET_KEY')
app.config['DEBUG'] = True
app.config['SQLALCHEMY_DATABASE_URI'] = "postgresql://postgres:postgres@localhost:5432/postgres"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['CACHE_TYPE'] = 'simple'
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_PERMANENT'] = True
app.config['PERMANENT_SESSION_LIFETIME'] = 3600  # 1 hour
app.config['GOOGLE_CLIENT_ID'] = os.getenv('GOOGLE_CLIENT_ID', None)
app.config['GOOGLE_CLIENT_SECRET'] = os.getenv('GOOGLE_CLIENT_SECRET', None)
app.config['GOOGLE_DISCOVERY_URL'] = "https://accounts.google.com/.well-known/openid-configuration"
app.json.compact = False


db = SQLAlchemy()
migrate = Migrate(app, db)
db.init_app(app)

api = Api(app)
bcrypt = Bcrypt(app)


# username = os.getenv('DB_USERNAME')
# password = os.getenv('DB_PASSWORD')
# host = os.getenv('DB_HOST')
# port = os.getenv('DB_PORT')
# database = os.getenv('DB_NAME')
# app_secret = os.getenv('APP_SECKET_KEY')
# flask_env = os.getenv('FLASK_ENV')



# class Config:
#   DEBUG = True
#   SQLALCHEMY_DATABASE_URI = "postgresql://postgres:postgres@localhost:5432/postgres"
#   if flask_env == 'production':
#     DEBUG = False
#     SQLALCHEMY_DATABASE_URI = f"postgresql://{username}:{password}@{host}:{port}/{database}"
#   CACHE_TYPE = 'simple'
#   SESSION_TYPE = 'filesystem'
#   SECRET_KEY = app_secret
#   SESSION_PERMANENT = True
#   PERMANENT_SESSION_LIFETIME = 3600  # Example: 1 hour
