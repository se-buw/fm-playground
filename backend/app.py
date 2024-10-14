from flask_cors import CORS
from flask_caching import Cache
from flask_session import Session
from flask_login import LoginManager
from flask_compress import Compress
from config import app, db
from routes.playground import *
from routes.authentication import *
from db.models import User
Session(app)
app.app_context().push()
CORS(app, supports_credentials=True)
cache = Cache(app)
Compress(app)
db.create_all()
app.register_blueprint(routes)
app.register_blueprint(authentication)
login_manager = LoginManager()
login_manager.init_app(app)

@login_manager.user_loader
def load_user(user_id):
  """
  This callback is used to reload the user object from the user ID stored in the session.
  It should take the unicode ID of a user, and return the corresponding user object.
  """
  return User.get(user_id)

if __name__ == '__main__':
  app.run(port=8000)