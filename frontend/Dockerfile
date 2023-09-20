FROM python:3.10-slim

WORKDIR /frontend

COPY . /frontend 

RUN pip install --no-cache-dir --upgrade pip setuptools
RUN pip install --no-cache-dir -r requirements.txt


EXPOSE 5000

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]