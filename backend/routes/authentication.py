from flask import redirect, abort, Blueprint, url_for, session, jsonify
from authlib.integrations.flask_client import OAuth
from flask_login import  login_user, logout_user
from db.models import User
from config import app, db, api
import os

authentication = Blueprint('authentication', __name__)
github_client_id = os.environ.get('GITHUB_CLIENT_ID')
github_client_secret = os.environ.get('GITHUB_CLIENT_SECRET')

oauth = OAuth(app)
oauth.register(
    name='google',
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={
        'scope': 'openid email profile'
    }
)

oauth.register(
    name='github',
    client_id=github_client_id,
    client_secret=github_client_secret,
    access_token_url='https://github.com/login/oauth/access_token',
    access_token_params=None,
    authorize_url='https://github.com/login/oauth/authorize',
    authorize_params=None,
    api_base_url='https://api.github.com/',
    client_kwargs={'scope': 'user:email'},
)


@authentication.route('/api')
def homepage():
    user = session.get('user_id')
    return f"Hello, {user['name']}!" if user else 'Hello, stranger!'


@app.route('/api/login/<name>')
def login(name):
    client = oauth.create_client(name)
    if not client:
        abort(404)

    redirect_uri = url_for('auth', name=name, _external=True)
    return client.authorize_redirect(redirect_uri)



@app.route('/api/auth/<name>')
def auth(name):
  client = oauth.create_client(name)
  if not client:
      abort(404)
  try:
    # Google and GitHub have different keys for getting email and profile info. 
    # So we need to check the provider.
    if name == 'google':
      token = client.authorize_access_token()
      user = token.get('userinfo')
      if not user:
          user = client.userinfo()       
      unique_id = f"google_{user['sub']}"
      email = user['email']
      
    elif name == 'github':
      # github = oauth.create_client('github')
      token = client.authorize_access_token()
      res = client.get('user', token=token)
      user = res.json()
      emails = client.get('user/emails')
      primary_email = next(filter(lambda x: x['primary'] == True, emails.json()))
      email = primary_email['email']
      unique_id = f"github_{user['id']}"
      # do something with the token and profile
      # print(user, token)
      print(unique_id, email)
      
    local_user = User(
        id=unique_id, email=email
      )
    
    # If user doesn't exist, add it to the database. (sign up)
    if not User.get(unique_id):
      local_user = User(
        id=unique_id, email=email
      )
      db.session.add(local_user)
      db.session.commit()

    db_user = User.get(unique_id)
    session['user_id'] = unique_id
    login_user(db_user, remember=True)
    
    return redirect("http://localhost:5173/")
  except Exception as e:
    print(f"Error during authentication: {e}")
    return abort(500)
  

# Get the current user
@authentication.route('/api/@me')
def get_user():
  user_id = session.get('user_id')
  if user_id is None:
    return {'error': '401 Unauthorized'}, 401
  user = User.query.filter_by(id=user_id).first()
  
  return jsonify({
    'message': 'Found user',
    'id': user.id,
    'email': user.email
    }), 200

@authentication.route('/api/check_session')
def check_session():
  user_id = session.get('user_id')
  if user_id is None:
    return {'error': '401 Unauthorized'}, 401
  user = User.query.filter_by(id=user_id).first()
  
  return jsonify({
    'message': 'Found user',
    'id': user.id,
    'email': user.email
    
    }), 200

# Logout the current user 
@authentication.route('/api/logout')
def logout():
  logout_user()
  session.pop('user_id', None)
  return jsonify({
    'message': 'Logged out successfully'
    }), 200
  
