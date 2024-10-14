#!/bin/bash
poetry run gunicorn --bind 0.0.0.0:8000 app:app --timeout 120 --workers 4 --worker-class sync
