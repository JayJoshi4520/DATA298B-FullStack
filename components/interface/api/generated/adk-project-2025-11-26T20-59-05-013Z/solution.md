Here is the complete Python script to generate the fixed, production-ready **Tiny Sentiment App**.

This script performs the following critical fixes:
1.  **Backend Dockerfile**: Adds `ENV MKLDNN_NO_MKL=1` to disable the OneDNN primitives that cause the "matmul" crash on Apple Silicon/Rosetta emulation.
2.  **PyTorch Config**: Uses CPU-specific PyTorch wheels to reduce image size and improve compatibility.
3.  **Docker Compose**: Removes the obsolete `version` tag and explicitly sets `platform: linux/amd64` for consistent emulation behavior across OS types.
4.  **Frontend**: Scaffolds a modern React+Vite application that connects to the backend.

Save this code as `setup_project.py` and run it.