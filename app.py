from flask import Flask, request, render_template, send_from_directory, jsonify
from flask_sqlalchemy import SQLAlchemy
import datetime
import hashlib
import time


app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = "postgresql://postgres:postgres@localhost:5432/postgres"
db = SQLAlchemy(app)
app.app_context().push()


class Data(db.Model):
  __tablename__ = 'data'
  id = db.Column(db.Integer, primary_key=True)
  user_ip = db.Column(db.String(40))
  time = db.Column(db.DateTime())
  check_type = db.Column(db.String(3))
  code = db.Column(db.String())
  permalink = db.Column(db.String())

db.create_all()

CHECK = {
  0: "VAL",
  1: "SAT",
  3: "QBF",
  4: "SMT",
  5: "SMV"  
}

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
  last_request_time = request.cookies.get('last_request_time')

  if last_request_time and time.time() - float(last_request_time) < 5:  # Allow one request per minute
    return {'permalink': "You've already made a request recently."}, 300
  
  try:
    data = request.get_json()
    curr_time = datetime.datetime.now()
    # user_ip = utils.get_ip()
    check = CHECK.get(data['check'], None)
    code = data['code']
    permalink = str(data['check'])+hashlib.md5(code.encode()).hexdigest()[:10]

    # check if the same code has been submitted before
    exist = Data.query.filter_by(permalink=permalink).filter_by(check_type=check).first() is not None
    if not exist:
      # time_diff = curr_time - datetime.timedelta(seconds=5)
      # check if user has submitted in the last 5 seconds
      # recent_entry = Data.query.filter_by(user_ip=user_ip).filter(Data.time > time_diff).first() is not None 
      # if not recent_entry:
      new_data = Data( time=curr_time, check_type=check, code=code, permalink=permalink)
      db.session.add(new_data)
      db.session.commit()
  except:
    db.session.rollback()
    raise Exception('Error saving data to database')
  finally:
    db.session.close()
  
  response = jsonify({'permalink': permalink})
  response.set_cookie('last_request_time', str(time.time()))
  
  return response, 200
  


@app.route('/<permalink>', methods=['GET'])
def get_code(permalink):
  data = Data.query.filter_by(permalink=permalink).first_or_404()
  return {'code': data.code}, 200 
  
  
  
if __name__ == '__main__':
    app.run(debug=True)