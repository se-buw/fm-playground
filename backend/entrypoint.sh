#!/bin/bash
gunicorn --bind 0.0.0.0:8000 app:app --timeout 120 --workers 32 --worker-class sync
