import sys
sys.path.append("..") # Adds higher directory to python modules path.
from flask import Blueprint, request, jsonify,  make_response
from backend.utils import tools

routes = Blueprint('routes', __name__)


@routes.route('/api/run-cmd-tool', methods=['POST'])
def run_cmd_tool():
  data = request.get_json()
  code = data['code']
  try:
    res = tools.run_tool(code)
    response = make_response(jsonify({'result': res}), 200)
  except:
    response = make_response(jsonify({'result': "Error running tool. Server is busy. Please try again"}), 503)

  return response