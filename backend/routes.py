import sys
import time
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify, session, make_response, abort
from utils.db import db, Data
from utils import xmv, z3
from utils.permalink_generator import generate_passphrase
from utils.db_query import *
import pytz
aware_datetime = datetime.now(pytz.utc)

routes = Blueprint('routes', __name__)

TIME_WINDOW = 1 

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


@routes.route('/api/')
def index():
  """Index page"""
  current_time = datetime.now(pytz.utc)
  last_request_time = session.get('last_request_time')
  if last_request_time is not None and current_time - last_request_time < timedelta(seconds=TIME_WINDOW):
    return abort(429) # Too Many Requests

  session['last_request_time'] = current_time
  return "Request accepted"
  


@routes.route('/api/save', methods=['POST'])
def save():
  current_time = datetime.now(pytz.utc)
  data = request.get_json()
  check_type = data['check']
  code = data['code']
  parent = get_id_by_permalink(data['parent'])
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