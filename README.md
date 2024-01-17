<div align="center">
  <img src="./frontend/public/logo_se.png" width="100px" />
  <h1>FM Playground</h1>
  <a href="https://play.formal-methods.net/"><img src="https://img.shields.io/website?url=https%3A%2F%2Fplay.formal-methods.net%2F&label=play.formal-methods.net" alt="FM Playground"></a>
  <img alt="GitHub Repository size" src="https://img.shields.io/github/repo-size/se-buw/fm-playground">
  <img src="https://img.shields.io/github/issues/se-buw/fm-playground" alt="GitHub issues">
  <img src="https://img.shields.io/github/license/se-buw/fm-playground" alt="GitHub License">
  <hr>
</div>




# FM Playground

This is the minimal template to start working with the FM Playground. 
This branch contains only an editor, plain output area, and a command-line tool execution - it does not have any database integration.

## Requirements
- Python >= 3.9.0 - [https://www.python.org/downloads/](https://www.python.org/downloads/)
- Node >= 18.0.0 - [https://nodejs.org/en/download](https://nodejs.org/en/download)
- Docker >= 20.10.0 (optional) - [https://docs.docker.com/engine/install/](https://docs.docker.com/engine/install/)
- Docker Compose >= 1.27.0 (optional)


## Getting Started

### Installation
- Clone the repository: `git clone -b minimal-template https://github.com/se-buw/fm-playground.git`
- Run-
  - Windows: `run.bat`
  - Unix: `run.sh` 
- The backend will run on `http://127.0.0.1:8000`
- The frontend will run on `http://127.0.0.1:5173`


### Docker



## License

This project is licensed under the [MIT License](LICENSE). 

### Third-Party Licenses

- Limboole - https://github.com/maximaximal/limboole/blob/master/LICENSE
- Z3 - https://github.com/Z3Prover/z3/blob/master/LICENSE.txt
- nuXmv - https://nuxmv.fbk.eu/downloads/LICENSE.txt
- Alloy - https://github.com/AlloyTools/org.alloytools.alloy/blob/master/LICENSE