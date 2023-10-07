from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Data(db.Model):
  __tablename__ = 'data'
  id = db.Column(db.Integer, primary_key=True)
  time = db.Column(db.DateTime())
  session_id = db.Column(db.String())
  parent = db.Column(db.String())
  check_type = db.Column(db.String(3))
  permalink = db.Column(db.String())
  code = db.Column(db.String())

def init_app(app):
  db.init_app(app)
  with app.app_context():
    print("Creating tables...")
    db.create_all()