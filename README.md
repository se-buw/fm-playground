<div align="center">
  <img src="./frontend/public/logo_se.png" width="100px" />
  <h1>FM Playground</h1>
  <a href="https://play.formal-methods.net/"><img src="https://img.shields.io/website?url=https%3A%2F%2Fplay.formal-methods.net%2F&label=play.formal-methods.net" alt="FM Playground"></a>
  <img alt="GitHub Repository size" src="https://img.shields.io/github/repo-size/se-buw/fm-playground">
  <img src="https://img.shields.io/github/issues/se-buw/fm-playground" alt="GitHub issues">
  <img src="https://img.shields.io/github/actions/workflow/status/se-buw/fm-playground/ci.yml" alt="Build">
  <img src="https://img.shields.io/github/license/se-buw/fm-playground" alt="GitHub License">
  <img src="https://img.shields.io/endpoint?url=https%3A%2F%2Fwakapi.soaib.me%2Fapi%2Fcompat%2Fshields%2Fv1%2Fsoaib%2Finterval%3Aany%2Fproject%3Afm-playground&style=flat&label=dev&color=%233b71ca" alt="Wakapi">
  <hr>
</div>

A Formal Method playground for limboole, z3, nuXmv, Alloy, and Spectra. This project is a part of the Formal Methods course at the Bauhaus-Universität Weimar. It is a web application that allows users to run formal methods tools in the browser.

## Overview and Examples

We started a small overview of the features of the FM Playground and how to use it. The video playlist is available on [YouTube](https://www.youtube.com/playlist?list=PLGyeoukah9NYq9ULsIuADG2r2QjX530nf)

<div align="center">

[![Formal Methods Playground](./resources/fmp-tutorial.jpg)](https://www.youtube.com/playlist?list=PLGyeoukah9NYq9ULsIuADG2r2QjX530nf)

</div>

For more updates, examples, and tutorials, please visit the [formal-methods.net](https://formal-methods.net) website.

## Development

### Requirements

- Python >= 3.10.0
- Node >= 20.0.0
- PostgreSQL >= 15.0 (optional) - use sqlite3 for development
- Docker >= 20.10.0 (optional)
- Docker Compose >= 1.27.0 (optional)

### Installation

- [TODO]

### Docker

- [TODO]

### Docker Compose

- Copy the `.env.example` file to `.env` and update the environment variables as needed:

```bash
cp .env.example .env
```

- Run the following command:

```bash
docker compose up -d
```

## Contributing

TODO: Create a contributing guide

Contributions are welcome! Please refer to the [contributing guidelines](CONTRIBUTING.md) for detailed instructions.

## License

This project is licensed under the [MIT License](LICENSE).

### Third-Party Licenses

- Limboole - https://github.com/maximaximal/limboole/blob/master/LICENSE
- Z3 - https://github.com/Z3Prover/z3/blob/master/LICENSE.txt
- nuXmv - https://nuxmv.fbk.eu/downloads/LICENSE.txt
- Alloy - https://github.com/AlloyTools/org.alloytools.alloy/blob/master/LICENSE
- Spectra - https://github.com/SpectraSynthesizer/spectra-synt/blob/master/LICENSE
