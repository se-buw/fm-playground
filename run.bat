@echo on
cd backend
copy .env.example .env
python -m venv .venv
call .\.venv\Scripts\activate
pip install -r requirements.txt
start cmd /k "python app.py"

cd ../frontend
copy .env.example .env
start cmd /k "npm install && npm run dev"
