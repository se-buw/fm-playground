import json
from .models import db, Data, Code, User
from sqlalchemy import func
from flask import jsonify

DATE_FORMAT = "%d %b %y %I:%M %p"

def code_exists_in_db(code: str):
  return db.session.query(Code).filter_by(code=code).first()

def code_exists_in_db_for_same_check(check:str, code: str):
  return db.session.query(Data).filter_by(code=code).filter_by(check_type=check).first()

def code_exists_in_db_different_check(code: str):
  return db.session.query(Data).filter_by(code=code).first()

def get_id_by_permalink(p: str):
  return db.session.query(Data).filter_by(permalink=p).first()

def get_user_history(user_id: int, page: int = 1, per_page: int = 20):
  """
  Get the user history of a user. The data is sorted by time in descending order.

  Parameters:
    user_id (int): The id of the user
    page (int): The page number
    per_page (int): The number of items per page
  
  Returns:
    list: The list of the data
    bool: True if there are more data, False otherwise
  """
  # Calculate start and end indices for pagination
  start_index = (page - 1) * per_page
  end_index = page * per_page

  # Query data with pagination
  query_result = db.session.query(
      Data.id,
      Data.time,
      Data.check_type,
      Data.permalink,
      Code.code
  ).join(Code, Data.code_id == Code.id).order_by(Data.time.desc()).filter(Data.user_id == user_id).slice(start_index, end_index).all()

  # Extract the data from the query result
  data = query_result

  result = []
  for d in data:
      p_time = d.time.strftime(DATE_FORMAT)
      p_code = d.code[:25] + "..." if len(d.code) > 25 else d.code
      result.append({
          'id': d.id,
          'time': p_time,
          'check': d.check_type,
          'permalink': d.permalink,
          'code': p_code
      })
  has_more_data  = True if len(result) == per_page else False
  return result, has_more_data 
  
def update_user_history_by_id(data_id: int):
  """
  Unlink the user history by id. 
  This function is used to unlink the user history from the user account.
  
  Parameters:
    data_id (int): The id of the data to unlink
  Returns:
    bool: True if the update is successful, False otherwise
  """
  try:
    db.session.query(Data).filter_by(id=data_id).update({"user_id": None})
    db.session.commit()
    return True
  except Exception:
    db.session.rollback()
    return False

def get_code_by_data_id(data_id: int):
  """
  Get the code by data id. Join the Data and Code table and get the code.
  
  Parameters:
    data_id (int): The id of the data
  Returns:
    Code: The code object
  """
  return db.session.query(
      Data.check_type,
      Data.permalink,
      Code.code
    ).join(Data, Data.code_id == Code.id).filter(Data.id == data_id).first()


def search_by_query(query, user_id: int = None):
  """
  Search the ``code`` history of a user by query.
  
  TODO : Add pagination if needed
  TODO : Currently query is case sensitive. Make it case insensitive and add fuzzy search. 
        Also check if we need any other parameters to search.
  
  Parameters:
    query (str): The query to search
    user_id (int): The id of the user
  Returns:
    list: The list of the data matching the query
  """
  search_result = db.session.query(
    Data.id,
    Data.time,
    Data.check_type,
    Data.permalink,
    Code.code
).join(Code, Data.code_id == Code.id).order_by(Data.time.desc()).filter(
    Data.user_id == user_id,
    func.lower(Code.code).ilike(func.lower(f'%{query}%'))
).all()
  

  data = search_result
  result = []
  for d in data:
      p_time = d.time.strftime(DATE_FORMAT)
      p_code = d.code[:25] + "..." if len(d.code) > 25 else d.code
      result.append({
          'id': d.id,
          'time': p_time,
          'check': d.check_type,
          'permalink': d.permalink,
          'code': p_code
      })
  return result


def get_user_data(user_id):
  user = User.query.filter_by(id=user_id).first()
  
  history = db.session.query(
      Data.id,
      Data.time,
      Data.check_type,
      Data.permalink,
      Code.code
  ).join(Code, Data.code_id == Code.id).order_by(Data.time.desc()).filter(Data.user_id == user_id).all()
  
  downloadables = []
  # add history to downloadables
  for h in history:    downloadables.append({
          'time': h.time.strftime(DATE_FORMAT),
          'check': h.check_type,
          'permalink': h.permalink,
          'code': h.code
      })
    
  return user.email, downloadables


def delete_user(user_id):
  try:
    db.session.query(Data).filter_by(user_id=user_id).update({"user_id": None})
    db.session.query(User).filter_by(id=user_id).delete()
    db.session.commit()
    return True
  except Exception:
    db.session.rollback()
    return False
  
  
def get_history_by_permalink(permalink: str, user_id: int):
  """
  Get the history by permalink.
  
  Parameters:
    permalink (str): The permalink of the data
  Returns:
    Data: The data object
  """
  query_result = db.session.query(
      Data.id,
      Data.time,
      Data.check_type,
      Data.permalink,
      Code.code
  ).join(Code, Data.code_id == Code.id).order_by(Data.time.desc()).filter(Data.permalink == permalink).filter(Data.user_id == user_id).first()

  result = {
      'check': query_result.check_type,
      'code': query_result.code,
      'id': query_result.id,
      'permalink': query_result.permalink,
      'time': query_result.time.strftime(DATE_FORMAT),
  }
  
  return result

def get_metadata_by_permalink(c: str, p: str, ) -> str:
  try:
    query_result = db.session.query(Data.meta).filter(Data.permalink == p, Data.check_type == c).first()
    if query_result is None:
      return json.dumps({"error": "No result found for the given permalink and check type."})
    meta_json_str = query_result[0]
      
      # Check if it's a valid JSON string format
    if not (meta_json_str and meta_json_str.startswith('{') and meta_json_str.endswith('}')):
      return json.dumps({"error": "No valid JSON string found in the query result."})
    meta_data = json.loads(meta_json_str) 
      
  except json.JSONDecodeError:
    return json.dumps({"error": "Error parsing JSON string."})
  except Exception as e:
    return json.dumps({"error": f"An unexpected error occurred: {str(e)}"})
  
  return json.dumps({"meta": meta_data.get("check") or meta_data.get("cli_option") or meta_data.get("cmd") or None})
    
