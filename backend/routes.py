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

TIME_WINDOW = 1 # time window within which multiple requests are not allowed

# Check if the code is too large
def is_valid_size(code: str) -> bool:
  size_in_bytes = sys.getsizeof(code)
  size_in_mb = size_in_bytes / (1024*1024)
  return size_in_mb <= 1


@routes.route('/api/')
def index():
    current_time = datetime.now(pytz.utc)
    last_request_time = session.get('last_request_time')
    if last_request_time is not None and current_time - last_request_time < timedelta(seconds=TIME_WINDOW):
        return abort(429)  # HTTP status code for "Too Many Requests"

    session['last_request_time'] = current_time
    return "Request accepted"
  


@routes.route('/api/save', methods=['POST'])
def save():
  current_time = datetime.now(pytz.utc)
  data = request.get_json()
  check_type = data['check']
  code = data['code'].strip()
  parent = data['parent']
  
  if not is_valid_size(code):
    response = make_response(jsonify({'result': "The code is too large."}), 413)
    return response
  
  last_request_time = session.get('last_request_time')
 
  # Allow one request per 5 seconds and same check
  if last_request_time is not None and current_time - last_request_time < timedelta(seconds=TIME_WINDOW):
    response = make_response(jsonify({'result': "You've already made a request recently."}), 429)
    return response
  
  try:
    exist_same_check = code_exists_in_db_for_same_check(check_type, code)
    if exist_same_check is not None: # Exist: Do not save again
      permalink = exist_same_check.permalink
      session['last_request_time'] = current_time
      response = make_response(jsonify({'check':check_type,'permalink': permalink}), 200)
      return response
    
    exist_different_check = code_exists_in_db_different_check(code)
    session_id = session.sid
    if exist_different_check is not None: # Exist but different check
      permalink = exist_different_check.permalink # replace the check type only
      new_data = Data( time= datetime.now(), session_id=session_id, parent=parent, check_type=check_type, code=code, permalink=permalink)
    else: # New: Generate a new permalink
      permalink = generate_passphrase()
      new_data = Data( time= datetime.now(), session_id=session_id, parent=parent, check_type=check_type, code=code, permalink=permalink)

    db.session.add(new_data)
    db.session.commit()
      
  except:
    db.session.rollback()
    response = make_response(jsonify({'permalink': "There is a problem. Please try after some time."}), 500)
    return response
  
  session['last_request_time'] = current_time
  response = make_response(jsonify({'check':check_type,'permalink': permalink}), 200)
  return response
  

@routes.route('/api/permalink/', methods=['GET'])
def get_code():
  check = request.args.get('check')
  p = request.args.get('p')
  data = Data.query.filter_by(permalink=p).filter_by(check_type=check).first_or_404()
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

  if last_request_time is not None and current_time - last_request_time < timedelta(seconds=TIME_WINDOW):
    response = make_response(jsonify({'error': "You've already made a request recently."}), 429)
    return response
  try:
    res = xmv.process_commands(code)
    response = make_response(jsonify({'result': res}), 200)
  except:
    response = make_response(jsonify({'result': "Error running nuXmv. Server is busy. Please try again after"}), 503)
  
  return response
  