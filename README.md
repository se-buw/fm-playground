# FM Playground
A Formal Method playground for limboole, z3, and NuXMV.

## Requirements
- Python 3.8+
- Nodejs (Download: https://nodejs.org/en/download)
- PostgreSQL (Download: https://www.postgresql.org/download/)
- Docker (Download: https://www.docker.com/products/docker-desktop)

## Features

## Setup:
- Clone the repository: `git clone https://github.com/se-buw/fm-playground.git`
- Checkout the dev branch: `git checkout dev`
- Create .env: `cp .env.example .env`
- Download nuXmv from https://nuxmv.fbk.eu/download.html
- Unzip the downloaded file and copy the executable directory *(nuXMv-"version"-"os-arch")* to `backend/nuXmv/`
- Create virtual environment for frontend: 
  - `cd frontend/`
  - `python -m venv .venv`
  - Windows: `.venv\Scripts\activate` or Linux: `source .venv/bin/activate`
  - `pip install -r requirements.txt`

- Instll monaco-editor:  
  - `cd static/` 
  - `npm install .`

- Deactivate virtual environment: `deactivate`

- Create virtual environment for frontend:  
  - `cd ../../backend`
  - `python -m venv .venv`
  - Windows: `.venv\Scripts\activate` or Linux: `source .venv/bin/activate`
  - `pip install -r requirements.txt`

- Deactivate virtual environment: `deactivate`

## Run:
Open two terminals:
- Run the backend: 
  - `cd backend/`
  - Windows: `.venv\Scripts\activate` or Linux: `source .venv/bin/activate`
  - `python run.py`
  - The backend will run on `http://127.0.0.1:8000`

- Run the frontend: 
  - `cd frontend/`
  - Windows: `.venv\Scripts\activate` or Linux: `source .venv/bin/activate`
  - `python app.py`
  - The frontend will run on `http://127.0.0.1:5000`

## Docker
- `docker compose up --build`
- The frontend will run on `http://127.0.0.1:5000`
- The backend will run on `http://127.0.0.1:8000`

## TODO
