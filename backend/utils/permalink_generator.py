from xkcdpass import xkcd_password as xp
from .db import db, Data


all_words = xp.generate_wordlist(wordfile= xp.locate_wordfile(), min_length=3, max_length=6)

def passphrase_exists_in_db(passphrase):
  return db.session.query(Data).filter_by(permalink=passphrase).first() is not None


def generate_passphrase(check):
  while True:
    passphrase = f'{check}-{xp.generate_xkcdpassword(all_words, numwords=4, delimiter="-")}'
    if not passphrase_exists_in_db(passphrase):
      print(f"Generated passphrase: {passphrase}")
      return passphrase