import sys
sys.path.append("..") # Adds higher directory to python modules path.
import time
import pytz
from datetime import datetime
aware_datetime = datetime.now(pytz.utc)
from flask import Blueprint, request, jsonify, session, make_response
from db.models import db, Data
from db.db_query import *
from utils.permalink_generator import generate_passphrase
from utils.logging_utils import *
from config import app, limiter

ALLOY_API_URL = os.getenv('ALLOY_API_URL')

routes = Blueprint('routes', __name__)

# ------------------ Helper Functions ------------------
def is_valid_size(code: str) -> bool:
  """Check if the code is less than 1MB

  Parameters:
    code (str): The code to be checked

  Returns:
    bool: True if the code is less than 1MB, False otherwise
  """
  size_in_bytes = sys.getsizeof(code)
  size_in_mb = size_in_bytes / (1024*1024)
  if size_in_mb > 1:
    app.logger.error(f'Code is too large. Size: {size_in_mb}MB')
  return size_in_mb <= 1
# ------------------ Helper Functions ------------------

# ------------------ Logging ------------------
@routes.before_request
def before_request():
  """Log the request before processing  """
  request.start_time = time.time()
  app.logger.info(generate_before_request_log(request))

@routes.after_request
def after_request(response):
  """Log the response after processing"""
  app.logger.info(generate_after_request_log(request, response))
  return response
# ------------------ Logging ------------------

@routes.route('/api/save', methods=['POST'])
@limiter.limit("2/second", error_message="You've already made a request recently.")
def save():
  user_id = session.get('user_id')
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
  p_gen_time = time.time()
  permalink = generate_passphrase()
  app.logger.info(f'Permalink Generation - Permalink: {permalink} Gen Time: {time.time() - p_gen_time}')
  try:
    code_id_in_db = code_exists_in_db(code)
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
                code_id=code_id,
                user_id=user_id
              )
    db.session.add(new_data)
    db.session.commit()
  except:
    app.logger.error(f'Error saving the code. Permalink: {permalink}')
    db.session.rollback()
    response = make_response(jsonify({'permalink': "There is a problem. Please try after some time."}), 500)
    return response
  session['last_request_time'] = current_time
  response = make_response(jsonify({'check':check_type,'permalink': permalink}), 200)
  return response
  
@routes.route('/api/permalink/', methods=['GET'])
def get_code():
  c = request.args.get('check').upper()
  p = request.args.get('p')
  code_data = Code.query.join(Data, Data.code_id == Code.id).filter_by(permalink=p).filter_by(check_type=c).first_or_404()
  response = make_response(jsonify({'code': code_data.code}))
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
 
@routes.route('/api/code/<int:data_id>', methods=['GET'])
def get_code_by_id(data_id: int):
  user_id = session.get('user_id')
  if user_id is None:
    return jsonify({'result': 'fail', 'message': 'You are not logged in.'}, 401)
  data = get_code_by_data_id(data_id)
  if data:
    return jsonify({'result': 'success', 'code': data.code, 'check': data.check_type, 'permalink': data.permalink})
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

# Download the user data
@routes.route('/api/download-user-data', methods=['GET'])
def download_user_data():
  user_id = session.get('user_id')
  if user_id is None:
    return jsonify({'result': 'fail', 'message': 'You are not logged in.'}, 401)
  user, data = get_user_data(user_id)
  return jsonify({'email':user, 'data': data})

# Delete the user profile and all the data
@routes.route('/api/delete-profile', methods=['DELETE'])
def delete_profile():
  user_id = session.get('user_id')
  if user_id is None:
    return jsonify({'result': 'fail', 'message': 'You are not logged in.'}, 401)
  if delete_user(user_id):
    return jsonify({'result': 'success'})
  return jsonify({'result': 'fail', 'message': 'There is a problem. Please try after some time.'}, 500)

# Get the history by permalink
@routes.route('/api/history/<permalink>', methods=['GET'])
def history_by_permalink(permalink: str):
  user_id = session.get('user_id')
  if user_id is None:
    return jsonify({'result': 'fail', 'message': 'You are not logged in.'}, 401) 
  data = get_history_by_permalink(permalink, user_id=user_id)
  if data:
    return jsonify({'history': data}), 200
  return jsonify({'result': 'fail', 'message': 'There is a problem. Please try after some time.'}, 500)

@routes.route('/api/metadata', methods=['GET'])
def get_metadata():
  c = request.args.get('check').upper()
  p = request.args.get('p')
  medatada = get_metadata_by_permalink(c, p)
  return jsonify(medatada), 200