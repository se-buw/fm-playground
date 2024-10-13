FROM python:3.10-slim

WORKDIR /backend
COPY . /backend 
RUN apt-get update && apt-get install -y

RUN pip install --no-cache-dir --upgrade pip setuptools
RUN pip install --no-cache-dir -r requirements.txt

RUN mkdir logs

EXPOSE 8000
ENTRYPOINT [ "./entrypoint.sh" ]