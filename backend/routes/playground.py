import sys
sys.path.append("..") # Adds higher directory to python modules path.
import time
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify, session, make_response, abort
from db.models import db, Data
from utils import xmv, z3
from utils.permalink_generator import generate_passphrase
from db.db_query import *
import pytz
from flask_login import current_user
aware_datetime = datetime.now(pytz.utc)

routes = Blueprint('routes', __name__)

# Time window for rate limiting
TIME_WINDOW = 1 # seconds


def is_valid_size(code: str) -> bool:
  """Check if the code is less than 1MB

  Parameters:
    code (str): The code to be checked

  Returns:
    bool: True if the code is less than 1MB, False otherwise
  """
  size_in_bytes = sys.getsizeof(code)
  size_in_mb = size_in_bytes / (1024*1024)
  return size_in_mb <= 1

# Index page
@routes.route('/api/', methods=['GET'])
def index():
  token = request.headers.get('Authorization')
  if token is None: 
    return jsonify({'result': 'fail', 'message': 'You are not logged in.'}), 401
  current_time = datetime.now(pytz.utc)
  last_request_time = session.get('last_request_time')
  if last_request_time is not None and current_time - last_request_time < timedelta(seconds=TIME_WINDOW):
    return abort(429) # Too Many Requests

  session['last_request_time'] = current_time
  # return "Request accepted"
  return f'Hello, {current_user.id}! You are logged in.'
  

# Save the code and return the permalink
# TODO: Separate the redundant functionality with save_with_metadata
@routes.route('/api/save', methods=['POST'])
def save():
  user_id = session.get('user_id')
  current_time = datetime.now(pytz.utc)
  data = request.get_json()
  check_type = data['check']
  code = data['code']
  parent = get_id_by_permalink(data['parent'])
  # parent = None
  if parent is None:
    parent_id = None
  else:
    parent_id = parent.id
  
  if not is_valid_size(code):
    response = make_response(jsonify({'result': "The code is too large."}), 413)
    return response
  
  last_request_time = session.get('last_request_time')
 
  # Allow one request per 5 seconds and same check
  if last_request_time is not None and current_time - last_request_time < timedelta(seconds=TIME_WINDOW):
    response = make_response(jsonify({'result': "You've already made a request recently."}), 429)
    return response
  
  permalink = generate_passphrase()
  try:
    code_id_in_db = code_exists_in_db(code)
    session['last_request_time'] = current_time
    session_id = session.sid
    if code_id_in_db is None: # New: Save the code
      new_code = Code(code=code)
      db.session.add(new_code)
      db.session.commit()
      code_id = new_code.id
    else: # Exist: Use the existing code id
      code_id = code_id_in_db.id


    new_data = Data( 
                time= datetime.now(), 
                session_id=session_id, 
                parent=parent_id, 
                check_type=check_type,  
                permalink=permalink,
                code_id=code_id,
                user_id=user_id
              )
    db.session.add(new_data)
    db.session.commit()
  except:
    db.session.rollback()
    response = make_response(jsonify({'permalink': "There is a problem. Please try after some time."}), 500)
    return response
  
  # session['last_request_time'] = current_time
  response = make_response(jsonify({'check':check_type,'permalink': permalink}), 200)
  return response
  

@routes.route('/api/permalink/', methods=['GET'])
def get_code():
  c = request.args.get('check').upper()
  p = request.args.get('p')
  code_data = Code.query.join(Data, Data.code_id == Code.id).filter_by(permalink=p).filter_by(check_type=c).first_or_404()
  response = make_response(jsonify({'code': code_data.code}))
  return response

@routes.route('/api/run_nuxmv', methods=['POST'])
def run_nuxmv():
  data = request.get_json()
  code = data['code']
  current_time = datetime.now(pytz.utc)

  # Check if the code is too large
  if not is_valid_size(code):
    return {'error': "The code is too large."}, 413

  last_request_time = session.get('last_request_time')

  if last_request_time is not None and current_time - last_request_time < timedelta(seconds=TIME_WINDOW):
    response = make_response(jsonify({'error': "You've already made a request recently."}), 429)
    return response
  try:
    res = xmv.process_commands(code)
    response = make_response(jsonify({'result': res}), 200)
  except:
    response = make_response(jsonify({'result': "Error running nuXmv. Server is busy. Please try again"}), 503)

  return response

@routes.route('/api/run_z3', methods=['POST'])
def run_z3():
  data = request.get_json()
  code = data['code']
  current_time = datetime.now(pytz.utc)

  # Check if the code is too large
  if not is_valid_size(code):
    return {'error': "The code is too large."}, 413

  last_request_time = session.get('last_request_time')

  if last_request_time is not None and current_time - last_request_time < timedelta(seconds=TIME_WINDOW):
    response = make_response(jsonify({'error': "You've already made a request recently."}), 429)
    return response
  try:
    res = z3.process_commands(code)
    response = make_response(jsonify({'result': res}), 200)
  except:
    response = make_response(jsonify({'result': "Error running Z3. Server is busy. Please try again"}), 503)
  
  return response

# TODO: Fix this route. probably merge with save
# TODO: Separate the redundant functionality
@routes.route('/api/save-with-metadata', methods=['POST'])
def save_with_metadata():
  current_time = datetime.now(pytz.utc)
  data = request.get_json()
  check_type = data['check']
  code = data['code']
  parent = get_id_by_permalink(data['parent'])
  metadata = data['meta']
  if parent is None:
    parent_id = None
  else:
    parent_id = parent.id

  if not is_valid_size(code):
    response = make_response(jsonify({'result': "The code is too large."}), 413)
    return response

  last_request_time = session.get('last_request_time')

  # Allow one request per 5 seconds and same check
  if last_request_time is not None and current_time - last_request_time < timedelta(seconds=TIME_WINDOW):
    response = make_response(jsonify({'result': "You've already made a request recently."}), 429)
    return response

  permalink = generate_passphrase()
  try:
    code_id_in_db = code_exists_in_db(code)
    session['last_request_time'] = current_time
    session_id = session.sid
    if code_id_in_db is None: # New: Save the code
      new_code = Code(code=code)
      db.session.add(new_code)
      db.session.commit()
      code_id = new_code.id
    else: # Exist: Use the existing code id
      code_id = code_id_in_db.id


    new_data = Data(
                time= datetime.now(),
                session_id=session_id,
                parent=parent_id,
                check_type=check_type,
                permalink=permalink,
                meta=metadata,
                code_id=code_id
              )
    db.session.add(new_data)
    db.session.commit()
  except:
    db.session.rollback()
    response = make_response(jsonify({'permalink': "There is a problem. Please try after some time."}), 500)
    return response

  # session['last_request_time'] = current_time
  response = make_response(jsonify({'check':check_type,'permalink': permalink}), 200)
  return response


@routes.route('/api/histories', methods=['GET'])
def get_history():
    user_id = session.get('user_id')
    if user_id is None:
        return jsonify({'result': 'fail', 'message': 'You are not logged in.'}, 401)

    page = request.args.get('page', 1, type=int)
    per_page = 20

    data, has_more_data = get_user_history(user_id, page=page, per_page=per_page)

    return jsonify({'history': data, 'has_more_data': has_more_data})


# Unlink the user history by id
@routes.route('/api/unlink-history', methods=['PUT'])
def unlink_history_by_id():
  user_id = session.get('user_id')
  if user_id is None:
    return jsonify({'result': 'fail', 'message': 'You are not logged in.'}, 401)
  
  data = request.get_json()
  data_id = data['id']
  if update_user_history_by_id(data_id):
    return jsonify({'result': 'success'})
  
  return jsonify({'result': 'fail', 'message': 'There is a problem. Please try after some time.'}, 500)
 
# Get the code by id 
@routes.route('/api/code/<int:data_id>', methods=['GET'])
def get_code_by_id(data_id: int):
  user_id = session.get('user_id')
  if user_id is None:
    return jsonify({'result': 'fail', 'message': 'You are not logged in.'}, 401)
  
  data = get_code_by_data_id(data_id)
  if data:
    return jsonify({'result': 'success', 'code': data.code})
  
  return jsonify({'result': 'fail', 'message': 'There is a problem. Please try after some time.'}, 500)

# Search the history data by query
@routes.route('/api/search', methods=['GET'])
def search():
  user_id = session.get('user_id')
  if user_id is None:
    return jsonify({'result': 'fail', 'message': 'You are not logged in.'}, 401)
  
  query = request.args.get('q')
  data = search_by_query(query, user_id=user_id)
  return jsonify({'history': data, 'has_more_data': False})


@routes.route('/api/download-user-data', methods=['GET'])
def download_user_data():
  user_id = session.get('user_id')
  if user_id is None:
    return jsonify({'result': 'fail', 'message': 'You are not logged in.'}, 401)
  
  user, data = get_user_data(user_id)
  return jsonify({'email':user, 'data': data})

@routes.route('/api/delete-profile', methods=['DELETE'])
def delete_profile():
  user_id = session.get('user_id')
  if user_id is None:
    return jsonify({'result': 'fail', 'message': 'You are not logged in.'}, 401)
  
  if delete_user(user_id):
    return jsonify({'result': 'success'})
  
  return jsonify({'result': 'fail', 'message': 'There is a problem. Please try after some time.'}, 500)


@routes.route('/api/history/<permalink>', methods=['GET'])
def history_by_permalink(permalink: str):
  user_id = session.get('user_id')
  if user_id is None:
    return jsonify({'result': 'fail', 'message': 'You are not logged in.'}, 401)
  
  data = get_history_by_permalink(permalink, user_id=user_id)
  if data:
    return jsonify({'history': data}), 200
  
  return jsonify({'result': 'fail', 'message': 'There is a problem. Please try after some time.'}, 500)