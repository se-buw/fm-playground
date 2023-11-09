from datetime import datetime
from flask_cors import CORS
from flask_caching import Cache
from flask import Flask,render_template, send_from_directory, request
import requests
app = Flask(__name__)
CORS(app)
cache = Cache(app, config={'CACHE_TYPE': 'simple'})
app.config['APPLICATION_ROOT'] = "/"


@app.route("/")
def index():
  return render_template("index.html")

# @app.route('/val')
# def validity():
#   return render_template("limboole/limboole.html", selected_option=0)

# @app.route('/sat')
# def Satisfiability():
#   return render_template("limboole/limboole.html", selected_option=1)

# @app.route('/qbf')
# def  QBFSatisfiability():
#   return render_template("limboole/limboole.html", selected_option=2)

# @app.route('/smt')
# def  smt():
#   return render_template("smt/smt.html", selected_option=3)

# @app.route('/xmv')
# def  nuxmv():
#   return render_template("xmv/xmv.html", selected_option=4)


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
 
@app.route('/favicon.ico')
def fevicon():
     return send_from_directory('static', 'favicon.ico')

@app.route('/proxy', methods=['GET'])
def proxy():
    url = request.args.get('url')
    response = requests.get(url)
    return response.content, response.status_code, response.headers.items()

if __name__ == '__main__':
    app.run(port=5000)