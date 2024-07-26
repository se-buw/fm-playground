#!/bin/bash
gunicorn --bind 0.0.0.0:8000 app:app --timeout 120 --workers 8 --threads 1 --worker-class gthread
