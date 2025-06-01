FROM python:3.10-alpine

RUN apk add --no-cache \
    bash \
    gcc \
    gzip \
    linux-headers \
    musl-dev \
    poetry \
    python3-dev \
    tar \
    wget
WORKDIR /backend
COPY pyproject.toml poetry.lock* ./
RUN poetry install --no-root

COPY . .
RUN sed -i -e 's/\r$//' entrypoint.sh && \
    chmod +x ./entrypoint.sh && \
    mkdir logs

EXPOSE 8000
ENTRYPOINT [ "./entrypoint.sh" ]