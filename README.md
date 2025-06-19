<div align="center">
  <img src="./frontend/public/logo_se.png" width="100px" />
  <h1>FM Playground</h1>
  <hr>
</div>

This branch showcases a proof-of-concept developed during the hackathon at the 2nd International Summer School on Formal Specifications and Analysis for Software Engineers (SPECS) 2025. It presents a streamlined version of the original FM Playground, emphasizing the visualization of Alloy models and its integration with Cope and Drag (CND).

## Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/se-buw/fm-playground.git -b specs2025 --depth 1
   ````
2. **Initialize the submodules**:
   ```bash
   git submodule update --init --recursive
   ```

3. **Create the Docker network** (if it doesn't exist):
   ```bash
   docker network create my_network
    ```
4. **Start the services**:
    ```bash
    docker compose -f docker-compose-specs2025.yml up --build
    ```
5. **Access the application**:
   Open your browser and go to [http://localhost:5173](http://localhost:5173/?check=ALSCnD).

## Notes
- To get latest changes of the submodules, run:
  ```bash
  git submodule update --remote --merge
  ```
- The `docker-compose-specs2025.yml` file is tailored for the SPECS 2025 hackathon setup. It includes configurations for the frontend, backend, Alloy API, and Cope and Drag (CND) services, ensuring they communicate over a shared Docker network.
