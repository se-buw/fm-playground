FROM python:3.10-alpine

RUN apk add --no-cache \
    poetry \
    gcc \
    python3-dev \
    musl-dev \
    linux-headers \
    wget \
    bash \
    gzip \
    tar
WORKDIR /backend
COPY pyproject.toml poetry.lock* ./
RUN poetry install

COPY . .
RUN sed -i -e 's/\r$//' entrypoint.sh
RUN chmod +x ./entrypoint.sh
RUN mkdir logs

EXPOSE 8000
ENTRYPOINT [ "./entrypoint.sh" ]