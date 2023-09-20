from .db import db, Data

def code_exists_in_db_for_same_check(check:int, code: str):
  return db.session.query(Data).filter_by(code=code).filter_by(check_type=check).first()

def code_exists_in_db_different_check(code: str):
  return db.session.query(Data).filter_by(code=code).first()