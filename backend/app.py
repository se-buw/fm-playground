import os
from flask_cors import CORS
from flask import Flask
from flask_caching import Cache
from config import Config
from utils.db import db, init_app
from routes import *
from flask_session import Session


app_secret = os.getenv("APP_SECKET_KEY", "secret_key")


def create_app():
  app = Flask(__name__)
  app.config.from_object(Config)
  Session(app)
  init_app(app)
  app.app_context().push()
  CORS(app, supports_credentials=True)
  cache = Cache(app)
  
  app.register_blueprint(routes)
  
  return app



if __name__ == '__main__':
  app = create_app()
  app.run(port=8000)