# OpenClaw "Cryonex CEO" Setup

This directory contains the configuration files to run the OpenClaw agent with the "Cryonex CEO" persona.

## Files

- `system_prompt.md`: Defines the aggressive, visionary 13yo CEO persona.
- `mission_config.yaml`: Contains the specific objectives for Global Benchmarking and MENA Domination.

## Deployment Instructions

1.  **Move Files**: Move the contents of this folder to your OpenClaw Docker volume or configuration directory.
    ```bash
    cp openclaw_setup/* ~/openclaw/config/ 
    # (Adjust destination path based on your Docker volume mount)
    ```

2.  **Run Docker**: Start the OpenClaw container using the `phioranex/openclaw-docker` image.
    ```bash
    docker run -d \
      --name openclaw-ceo \
      -v ~/openclaw/config:/app/config \
      -v ~/openclaw/workspace:/app/workspace \
      phioranex/openclaw-docker:latest
    ```

3.  **Monitor**: Connect to the container or check logs to see the CEO in action.
    ```bash
    docker logs -f openclaw-ceo
    ```

## Mission Verified
- [x] Global Benchmarking (NotebookLM, Quizlet)
- [x] MENA & Saudi Vision 2030 Strategy
- [x] Hardware-Aware Execution Protocols
