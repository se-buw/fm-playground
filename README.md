<div align="center">
  <img src="./frontend/public/logo_se.png" width="100px" />
  <h1>FM Playground</h1>
  <a href="https://play.formal-methods.net/"><img src="https://img.shields.io/website?url=https%3A%2F%2Fplay.formal-methods.net%2F&label=play.formal-methods.net" alt="FM Playground"></a>
  <img alt="GitHub Repository size" src="https://img.shields.io/github/repo-size/se-buw/fm-playground">
  <img alt="Total Lines" src="https://tokei.rs/b1/github/se-buw/fm-playground">
  <img src="https://img.shields.io/github/issues/se-buw/fm-playground" alt="GitHub issues">
  <img src="https://img.shields.io/github/license/se-buw/fm-playground" alt="GitHub License">
  <hr>
</div>


# FM Playground

A Formal Method playground for limboole, z3, nuXmv, Alloy, and Spectra. This project is a part of the  Formal Methods course at the Bauhaus-Universität Weimar. It is a web application that allows users to run formal methods tools in the browser. 

## Requirements
- Python >= 3.9.0
- Node >= 18.0.0
- PostgreSQL >= 15.0
- Docker >= 20.10.0 (optional)
- Docker Compose >= 1.27.0 (optional)


## Getting Started

### Installation

- [Frontend](frontend/README.md)
- [Backend](backend/README.md)

### Docker

- [Frontend](frontend/README.md#docker)
- [Backend](backend/README.md#docker)

### Docker Compose

- Copy the `.env.example` file to `.env` and update the environment variables as needed:
```bash
cp .env.example .env
```
- Run the following command:
```bash
docker-compose up -d
```

```yml
version: '3'
services:
  frontend:
    image: ghcr.io/se-buw/fm-playground-frontend:latest
    container_name: fmp-frontend
    env_file:
      - .env
    ports:
      - "5173:5173"
    networks:
      - my_network
    restart: unless-stopped
  
  backend:
    image: ghcr.io/se-buw/fm-playground-backend:latest
    container_name: fmp-backend
    env_file:
      - .env
    ports:
      - "8000:8000"
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - my_network
    restart: unless-stopped
  
  postgres:
    image: postgres:15.4
    container_name: fmp-db
    environment:
      POSTGRES_USER: ${DB_USERNAME}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5
    env_file:
          - .env
    networks:
      - my_network
    restart: unless-stopped
  
  # Alloy API
  api:
    build:
      context: ./alloy-app/api/
    container_name: fmp-alloy-api
    ports:
      - "8080:8080"
    networks:
      - my_network
    restart: unless-stopped
  
  # Database for alloy
  mongo:
    image: mongo:4.4.6
    container_name: fmp-mongo
    command: mongod --storageEngine=wiredTiger
    volumes:
      - mongo_data:/data/db
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: example
    networks:
      - my_network
    restart: unless-stopped
  
  # Alloy application with meteor
  meteor:
    build:
      context: ./alloy-app/meteor/
    container_name: fmp-alloy-app
    environment:
      MONGO_URL: ${MONGO_URL}
      METEOR_SETTINGS: ${METEOR_SETTINGS}
      STARTUP_DELAY: ${STARTUP_DELAY}
    depends_on:
      - backend
      - postgres
      - mongo
    links:
      - mongo
      - api
    networks:
      - my_network
    restart: unless-stopped

volumes:
  postgres_data:
  mongo_data:

networks:
  my_network:
    driver: bridge
```


## Contributing

Contributions are welcome!  Please refer to the [contributing guidelines](CONTRIBUTING.md) for detailed instructions.


## License

This project is licensed under the [MIT License](LICENSE). 

### Third-Party Licenses

- Limboole - https://github.com/maximaximal/limboole/blob/master/LICENSE
- Z3 - https://github.com/Z3Prover/z3/blob/master/LICENSE.txt
- nuXmv - https://nuxmv.fbk.eu/downloads/LICENSE.txt
- Alloy - https://github.com/AlloyTools/org.alloytools.alloy/blob/master/LICENSE
- Spectra - https://github.com/SpectraSynthesizer/spectra-synt/blob/master/LICENSE