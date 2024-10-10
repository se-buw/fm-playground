from http.client import HTTPException
from dotenv import load_dotenv
from flask import Blueprint, request, jsonify, make_response
from utils.tasks import run_limboole
from utils.redis_utils import generate_cache_key, get_cache

load_dotenv()

cache_routes = Blueprint('cache', __name__)

@cache_routes.route('/api/limboole-cache', methods=['POST'])
def limboole_cache():
    try:
        request_data = request.get_json()
        code = request_data.get('code')
        check_sat = request_data.get('check_sat')
        if not code:
            return make_response(jsonify({"error": "Code is required"}), 400)
        if not check_sat and type(check_sat) != bool:
            return make_response(jsonify({"error": "Check_sat is required and must be a boolean"}), 400)
        cache_key = generate_cache_key(code, check_sat)
        cached_result = get_cache(cache_key)
        if cached_result:
            return jsonify({
                'status': 'cached',
                'result': cached_result.decode()  
            })
        task = run_limboole.delay(code, check_sat)

        return jsonify({
            'status': 'processing',
            'task_id': task.id
        })

    except HTTPException as e:
        return make_response(jsonify({"error": str(e)}), 500)

#TODO Implement this route
@cache_routes.route('/api/smt-cache', methods=['POST'])
def smt_cache():
    pass