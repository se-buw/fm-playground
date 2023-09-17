import os
import sys
import time
import hashlib
from datetime import datetime, timedelta
from flask_cors import CORS
from flask import Flask, request, render_template, send_from_directory, jsonify, session, make_response
from flask_sqlalchemy import SQLAlchemy
import xmv_utils


username = os.getenv('DB_USERNAME', 'postgres')
password = os.getenv('DB_PASSWORD', 'postgres')
host = os.getenv('DB_HOST', 'postgres')
port = os.getenv('DB_PORT', '5432')
database = os.getenv('DB_NAME', 'postgres')
app_secret = os.getenv("APP_SECKET_KEY", "secret_key")

app = Flask(__name__)
CORS(app)
app.secret_key = app_secret

app.config['SQLALCHEMY_DATABASE_URI'] = f"postgresql://{username}:{password}@{host}:{port}/{database}"
# app.config['SQLALCHEMY_DATABASE_URI'] = "postgresql://postgres:postgres@localhost:5432/postgres"
# app.config['APPLICATION_ROOT'] = "/fm"
db = SQLAlchemy(app)
app.app_context().push()


class Data(db.Model):
  __tablename__ = 'data'
  id = db.Column(db.Integer, primary_key=True)
  time = db.Column(db.DateTime())
  check_type = db.Column(db.String(3))
  code = db.Column(db.String())
  permalink = db.Column(db.String())

Data.__table__.create(db.engine, checkfirst=True)
#db.create_all()

CHECK = {
  0: "VAL",
  1: "SAT",
  2: "QBF",
  3: "SMT",
  4: "SMV"  
}

REQ_TIME_WINDOW = 5 # time window within which multiple requests are not allowed

# Check if the code is too large
def is_valid_size(code: str) -> bool:
  size_in_bytes = sys.getsizeof(code)
  size_in_mb = size_in_bytes / (1024*1024)
  return size_in_mb <= 1


@app.route("/")
def index():
  return render_template("index.html")
 
@app.route('/coi-serviceworker.js')
def coi_serviceworker_js():
    return send_from_directory(app.root_path, 'coi-serviceworker.js')

@app.route('/z3-play.js')
def z3_play_js():
    return send_from_directory(app.root_path, 'z3-play.js')
  
@app.route('/z3.js')
def z3_js():
    return send_from_directory(app.root_path, 'z3.js')

@app.route('/z3.wasm')
def z3_wasm():
    return send_from_directory(app.root_path, 'z3.wasm')

@app.route('/z3.worker.js')
def z3_worker_js():
    return send_from_directory(app.root_path, 'z3.worker.js')
  
@app.route('/dimacs2boole.js')
def dimacs2boole_js():
    return send_from_directory(app.root_path, 'dimacs2boole.js')

@app.route('/dimacs2boole.wasm')
def dimacs2boole_wasm():
    return send_from_directory(app.root_path, 'dimacs2boole.wasm')

@app.route('/limboole.js')
def limboole_js():
    return send_from_directory(app.root_path, 'limboole.js')

@app.route('/main.js')
def main_js():
    return send_from_directory(app.root_path, 'main.js')

@app.route('/limboole.wasm')
def limboole_wasm():
    return send_from_directory(app.root_path, 'limboole.wasm') 
  
@app.route('/save', methods=['POST'])
def save():
  current_timestamp = time.time()
  data = request.get_json()
  check = CHECK.get(data['check'], None)
  code = data['code']
  
  if not is_valid_size(code):
    response = make_response(jsonify({'result': "The code is too large."}), 413)
    return response
  
  last_request_time = session.get('last_request_time')
 
  # Allow one request per 5 seconds and same check
  if last_request_time is not None and current_timestamp - last_request_time < REQ_TIME_WINDOW:
    response = make_response(jsonify({'result': "You've already made a request recently."}), 429)
    return response
  
  try:
    permalink = str(data['check'])+hashlib.md5(code.encode()).hexdigest()[:10]
    
    # check if the same code has been submitted before
    exist = Data.query.filter_by(permalink=permalink).filter_by(check_type=check).first() is not None
    if not exist:
      new_data = Data( time= datetime.now(), check_type=check, code=code, permalink=permalink)
      db.session.add(new_data)
      db.session.commit()
      
  except:
    db.session.rollback()
    response = make_response(jsonify({'result': "There is a problem. Please try after some time."}), 500)
    return response
  
  session['last_request_time'] = current_timestamp
  response = make_response(jsonify({'permalink': permalink}), 200)
  return response
  

@app.route('/<permalink>', methods=['GET'])
def get_code(permalink):
  data = Data.query.filter_by(permalink=permalink).first_or_404()
  response = make_response(jsonify({'code': data.code}))
  return response

@app.route('/run_nuxmv', methods=['POST'])
def run_nuxmv():
  data = request.get_json()
  code = data['code']
  current_timestamp = time.time()

  # Check if the code is too large
  if not is_valid_size(code):
    return {'error': "The code is too large."}, 413

  last_request_time = session.get('last_request_time')
  #last_check_type = session.get('last_check_type')
  
  if last_request_time is not None and current_timestamp - last_request_time < REQ_TIME_WINDOW:
    response = make_response(jsonify({'error': "You've already made a request recently."}), 429)
    return response
  
  try:
    res = xmv_utils.process_commands(code)
    response = make_response(jsonify({'result': res}), 200)
  except:
    response = make_response(jsonify({'result': "Error running nuXmv. Server is busy. Please try again after"}), 503)
  
  return response
  



if __name__ == '__main__':
    app.run()