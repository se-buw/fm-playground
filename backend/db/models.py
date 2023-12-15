from flask_login import UserMixin


from config import db


class User(db.Model, UserMixin):
  __tablename__ = 'users'
  id = db.Column(db.String, primary_key=True, unique=True)
  email = db.Column(db.String())
  
  data = db.relationship('Data', backref='users', lazy=True)
  
  def get(user_id):
    user = User.query.filter_by(id=user_id).first()
    return user

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
  meta = db.Column(db.String())
  
  code_id = db.Column(db.Integer, db.ForeignKey('code.id'), nullable=False)
  user_id = db.Column(db.String, db.ForeignKey('users.id'), nullable=True)
  