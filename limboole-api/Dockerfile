FROM python:3.10-alpine
RUN apk add --no-cache poetry
RUN apk add --no-cache bash curl
WORKDIR /app
COPY pyproject.toml poetry.lock* ./
RUN poetry install --no-root
COPY . .
RUN sed -i -e 's/\r$//' install_dependencies.sh
RUN chmod +x ./install_dependencies.sh
RUN ./install_dependencies.sh
EXPOSE 8080
CMD ["poetry", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
