import os
from flask_cors import CORS
from flask import Flask
from flask_caching import Cache
from config import Config
from utils.db import db, init_app
from routes import *


app_secret = os.getenv("APP_SECKET_KEY", "secret_key")



# # app.config['SQLALCHEMY_DATABASE_URI'] = f"postgresql://{username}:{password}@{host}:{port}/{database}"
# app.config['SQLALCHEMY_DATABASE_URI'] = "postgresql://postgres:postgres@localhost:5432/postgres"
# app.config['CACHE_TYPE'] = 'simple' 
# app.config['APPLICATION_ROOT'] = "/fm"
# db = SQLAlchemy(app)
# app.app_context().push()


def create_app():
  app = Flask(__name__)
  app.secret_key = "secret_key"
  app.config.from_object(Config)
  init_app(app)
  app.app_context().push()
  CORS(app, supports_credentials=True)
  cache = Cache(app)
  
  app.register_blueprint(routes)
  
  return app


if __name__ == '__main__':
  app = create_app()
  app.run(port=8000)