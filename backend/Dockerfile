FROM python:3.10-slim


WORKDIR /backend

COPY . /backend 

RUN apt-get update && apt-get install -y
RUN apt-get install z3 -y

RUN pip install --no-cache-dir --upgrade pip setuptools
RUN pip install --no-cache-dir -r requirements.txt

ENV DB_USERNAME: ${DB_USERNAME}
ENV DB_PASSWORD: ${DB_PASSWORD}
ENV DB_HOST: ${DB_HOST}
ENV DB_PORT: ${DB_PORT}
ENV APP_SECKET_KEY: ${APP_SECKET_KEY}
ENV FLASK_ENV=${FLASK_ENV}

EXPOSE 8000

RUN chmod a+x ./entrypoint.sh
ENTRYPOINT [ "./entrypoint.sh" ]