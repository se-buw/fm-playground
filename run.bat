@echo on
cd backend
python -m venv .venv
call .\.venv\Scripts\activate
pip install -r requirements.txt
start cmd /k "python app.py"

cd ../frontend
start cmd /k "npm install && npm run dev"
