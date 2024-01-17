#!/bin/bash

cd backend
cp .env.example .env
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py &

cd ../frontend
cp .env.example .env
npm install && npm run dev
