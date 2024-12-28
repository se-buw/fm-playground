# FM Playground (Frontend)

## Table of Contents

- [FM Playground (Frontend)](#fm-playground-frontend)
  - [Table of Contents](#table-of-contents)
  - [Description](#description)
  - [Prerequisites](#prerequisites)
  - [Getting Started](#getting-started)
    - [Installation](#installation)
    - [Docker](#docker)
  - [Contributing](#contributing)
  - [License](#license)

## Description

This is the frontend for the FM Playground application. FM Playground is a web application that allows users to run formal methods tools in the browser. Currently, the application supports the following tools:

- [Limboole](https://fmv.jku.at/limboole/) - A SAT-based tool for Boolean reasoning.
- [Z3](https://github.com/Z3Prover/z3) - A SMT solver developed at Microsoft Research.
- [nuXmv ](https://nuxmv.fbk.eu/) - A symbolic model checker for the analysis of synchronous finite-state and infinite-state systems.
- ~~[Alloy](https://alloytools.org/)~~ (in a separate UI) - A declarative modeling language for software systems.

## Prerequisites

List any dependencies that must be installed before running the application.

- Node.js v18.0.0 or higher
- npm v7.0.0 or higher or yarn v1.22.0 or higher
- Docker v20.10.0 or higher (optional)
- Docker Compose v1.27.0 or higher (optional)

## Getting Started

### Installation

1. Clone the repository:

```bash
git clone https://github.com/se-buw/fm-playground
```

2. Navigate to the project directory:

```bash
cd frontend
```

3. Copy the `.env.example` file to `.env` and update the environment variables as needed:

```bash
cp .env.example .env
```

4. Install dependencies: `npm install`or`yarn install`

5. Start the development server:`npm run dev` or `yarn dev`

### Docker

1. Build the docker image:

```bash
docker build -t fm-play-frontend .
```

2. Run the docker image:

```bash
docker run --name fm-play-frontend \
    --env-file .env  \
    -p 5173:5173 fm-play-frontend
```

Note: If you want to run the frontend together with the backend, you can use the docker compose file.
Find the complete docker compose file [here](../docker-compose.yml).

## Contributing

Contributions are welcome! Please refer to the [contributing guidelines](../CONTRIBUTING.md) for detailed instructions.

## License

This project is licensed under the [MIT License](../LICENSE).
