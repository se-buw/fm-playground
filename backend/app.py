from flask_cors import CORS
from flask_caching import Cache
from flask_session import Session

from config import app
from routes.playground import *


Session(app)
app.app_context().push()
CORS(app, supports_credentials=True)
cache = Cache(app)
app.register_blueprint(routes)




if __name__ == '__main__':
  app.run(port=8000)