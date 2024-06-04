#!/bin/bash

flask db upgrade

gunicorn --bind 0.0.0.0:8000 app:app --timeout 120 --workers 4 --threads 2 --worker-class gthread
