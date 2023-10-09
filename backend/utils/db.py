from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()



class Code(db.Model):
  __tablename__ = 'code'
  id = db.Column(db.Integer, primary_key=True)
  code = db.Column(db.String())
  
  data = db.relationship('Data', backref='code', lazy=True)

class Data(db.Model):
  __tablename__ = 'data'
  id = db.Column(db.Integer, primary_key=True)
  time = db.Column(db.DateTime())
  session_id = db.Column(db.String())
  parent = db.Column(db.Integer)
  check_type = db.Column(db.String())
  permalink = db.Column(db.String())
  
  code_id = db.Column(db.Integer, db.ForeignKey('code.id'), nullable=False)
  
  
  



def init_app(app):
  db.init_app(app)
  with app.app_context():
    print("Creating tables...")
    db.create_all()