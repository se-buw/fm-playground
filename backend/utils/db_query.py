from .db import db, Data, Code

def code_exists_in_db(code: str):
  print(db.session.query(Code).filter_by(code=code).first())
  return db.session.query(Code).filter_by(code=code).first()

def code_exists_in_db_for_same_check(check:str, code: str):
  return db.session.query(Data).filter_by(code=code).filter_by(check_type=check).first()

def code_exists_in_db_different_check(code: str):
  return db.session.query(Data).filter_by(code=code).first()

def get_id_by_permalink(p: str):
  return db.session.query(Data).filter_by(permalink=p).first()
