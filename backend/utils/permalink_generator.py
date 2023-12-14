from xkcdpass import xkcd_password as xp
from config import db
from db.models import Data


all_words = xp.generate_wordlist(wordfile= xp.locate_wordfile(), min_length=3, max_length=6)

def passphrase_exists_in_db(passphrase):
  return db.session.query(Data).filter_by(permalink=passphrase).first() is not None


def generate_passphrase():
  while True:
    passphrase = xp.generate_xkcdpassword(all_words, numwords=4, delimiter="-")
    if not passphrase_exists_in_db(passphrase):
      return passphrase
