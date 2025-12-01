ISSUES FOUND:
- The project uses `react-scripts` (Create React App), which is considered legacy tooling. The strict review guidelines explicitly state to **REJECT create-react-app** in favor of **Vite**. The `package.json` must be updated to use `vite` and `@vitejs/plugin-react`.
- Missing `vite.config.js` which is required for a modern React project.
- `package.json` scripts are incorrect for a Vite project. They should be `"dev"`, `"build"`, and `"preview"`, not `"start"`, `"test"`, `"eject"`.
- `index.html` is located in `frontend/public/`, but in a Vite project, it **must be in the project root** (`frontend/index.html`) and must contain the `<script type="module" src="/src/index.js"></script>` entry point tag (which is currently missing).
- `App.js` contains a hardcoded API URL (`http://localhost:8000/generate`), which ignores the `REACT_APP_API_URL` environment variable defined in `docker-compose.yml`. In a Vite setup, this should use `import.meta.env.VITE_API_URL` (and the env var in docker-compose should be updated to `VITE_API_URL`).
- `docker-compose.yml` sets `REACT_APP_API_URL`, which follows Create React App conventions. For Vite, environment variables exposed to the client must be prefixed with `VITE_`.

Please refactor the frontend to use the **Vite** build tool structure.