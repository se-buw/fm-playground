# FM Playground (Backend)

## Table of Contents

- [FM Playground (Backend)](#fm-playground-backend)
  - [Table of Contents](#table-of-contents)
  - [Description](#description)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
    - [🚧TODO: Update with v2.0.0 architecture (use docker compose for now)](#todo-update-with-v200-architecture-use-docker-compose-for-now)
    - [Docker](#docker)
  - [Contributing](#contributing)
  - [License](#license)

## Description

This is the backend for the FM Playground application. FM Playground is a web application that allows users to run formal methods tools in the browser. 


## Prerequisites

List any dependencies that must be installed before running the application.

- Python v3.10.0 or higher
- Flask v2.0.0 or higher
- Docker v20.10.0 or higher (optional)
- Docker Compose v1.27.0 or higher (optional)



## Installation

### 🚧TODO: Update with v2.0.0 architecture (use docker compose for now)

1. Clone the repository:

```bash
git clone https://github.com/se-buw/fm-playground
```
2. Navigate to the project directory:

```bash
cd backend
```

3. Copy the `.env.example` file to `.env` and update the environment variables as needed:

```bash
cp .env.example .env
```

4. Install dependencies: ```pip install -r requirements.txt```

5. Start the development server: `python app.py` 


### Docker

1. Build the docker image:

```bash
docker build -t fm-play-backend .
```  
2. Run the docker image:

```bash
docker run --name fm-play-backend \
    --env-file .env  \
    -p 8000:8000 fm-play-backend
```

Note: If you want to run the backend together with the frontend, you can use the docker compose file.
Find the complete docker compose file [here](../docker-compose.yml).

## Contributing

Contributions are welcome!  Please refer to the [contributing guidelines](../CONTRIBUTING.md) for detailed instructions.


## License

This project is licensed under the [MIT License](../LICENSE).