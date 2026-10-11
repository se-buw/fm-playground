FROM python:3.13-slim

RUN apt-get update \
	&& apt-get install -y --no-install-recommends curl \
	&& rm -rf /var/lib/apt/lists/*

# Install Poetry
ENV POETRY_VERSION=2.2.1 POETRY_HOME=/opt/poetry POETRY_VIRTUALENVS_CREATE=false
RUN curl -sSL https://install.python-poetry.org | python - --version "$POETRY_VERSION" \
	&& ln -s /opt/poetry/bin/poetry /usr/local/bin/poetry
WORKDIR /app
# The vendored smt-diff library is a path dependency, so it is needed to install.
COPY pyproject.toml poetry.lock* ./
COPY vendor ./vendor
RUN poetry install --only main
COPY . .
EXPOSE 8080
# Witness streams live in process memory: keep a single worker process.
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080", "--workers", "1"]
