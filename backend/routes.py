import sys
import time
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify, session, make_response, abort
from utils.db import db, Data
from utils import xmv 
from utils.permalink_generator import generate_passphrase
from utils.db_query import *
import pytz
aware_datetime = datetime.now(pytz.utc)


routes = Blueprint('routes', __name__)


CHECK = {
  0: "VAL",
  1: "SAT",
  2: "QBF",
  3: "SMT",
  4: "SMV"  
}

TIME_WINDOW = 5 # time window within which multiple requests are not allowed

# Check if the code is too large
def is_valid_size(code: str) -> bool:
  size_in_bytes = sys.getsizeof(code)
  size_in_mb = size_in_bytes / (1024*1024)
  return size_in_mb <= 1


@routes.route('/api/')
def index():
    # Get the current time
    current_time = datetime.now(pytz.utc)
    # Check if the last request time is stored in the session
    last_request_time = session.get('last_request_time')
    # print(f"Last request time: {last_request_time}")

    if last_request_time is not None and current_time - last_request_time < timedelta(seconds=TIME_WINDOW):
        # If the last request was within the time window, deny the request
        return abort(429)  # HTTP status code for "Too Many Requests"

    # Update the session with the current time
    session['last_request_time'] = current_time

    # Process the request normally
    return "Request accepted"
  


@routes.route('/api/save', methods=['POST'])
def save():
  current_time = datetime.now(pytz.utc)
  data = request.get_json()
  check = CHECK.get(data['check'], None)
  code = data['code'].strip()
  parent = data['parent']
  
  if not is_valid_size(code):
    response = make_response(jsonify({'result': "The code is too large."}), 413)
    return response
  
  last_request_time = session.get('last_request_time')
  # print(f"Last request time: {last_request_time}")
 
  # Allow one request per 5 seconds and same check
  if last_request_time is not None and current_time - last_request_time < timedelta(seconds=TIME_WINDOW):
    response = make_response(jsonify({'result': "You've already made a request recently."}), 429)
    return response
  
  try:
    exist_same_check = code_exists_in_db_for_same_check(check, code)
    if exist_same_check is not None: # Exist: Do not save again
      permalink = exist_same_check.permalink
      # print(f"Exist: {permalink}")
      session['last_request_time'] = current_time
      response = make_response(jsonify({'permalink': permalink}), 200)
      return response
    
    exist_different_check = code_exists_in_db_different_check(code)
    if exist_different_check is not None: # Exist but different check
      permalink = f"{data['check']}{exist_different_check.permalink[1:]}" # replace the check type only
      # print(f"Exist but different check: {permalink}")
    else: # New: Generate a new permalink
      permalink = generate_passphrase(data['check'])

    session_id = session.sid
    # print(f"Session ID: {session_id}")
    new_data = Data( time= datetime.now(), session_id=session_id, parent=parent, check_type=check, code=code, permalink=permalink)
    db.session.add(new_data)
    db.session.commit()
      
  except:
    db.session.rollback()
    response = make_response(jsonify({'permalink': "There is a problem. Please try after some time."}), 500)
    return response
  
  session['last_request_time'] = current_time
  # print(session)
  response = make_response(jsonify({'permalink': permalink}), 200)
  return response
  

@routes.route('/api/<permalink>', methods=['GET'])
def get_code(permalink):
  data = Data.query.filter_by(permalink=permalink).first_or_404()
  response = make_response(jsonify({'code': data.code}))
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
  #last_check_type = session.get('last_check_type')
  
  if last_request_time is not None and current_time - last_request_time < timedelta(seconds=TIME_WINDOW):
    response = make_response(jsonify({'error': "You've already made a request recently."}), 429)
    return response
  
  try:
    res = xmv.process_commands(code)
    response = make_response(jsonify({'result': res}), 200)
  except:
    response = make_response(jsonify({'result': "Error running nuXmv. Server is busy. Please try again after"}), 503)
  
  return response
  