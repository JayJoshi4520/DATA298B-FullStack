ISSUES FOUND:
- The frontend project is set up using `react-scripts` (Create React App), which is considered outdated and violates the requirement to use Vite ("REJECT if using Vue CLI or create-react-app without Vite").
- `frontend/package.json` is missing `vite` and `@vitejs/plugin-react` dependencies; it currently lists `react-scripts`.
- `frontend/vite.config.js` is missing.
- The file structure for the frontend follows Create React App conventions (`index.html` in `public/`) instead of Vite conventions (`index.html` in project root).
- `frontend/index.html` is missing the `<script type="module" src="/src/index.js"></script>` entry point required by Vite.
- Environment variables use the `REACT_APP_` prefix (`REACT_APP_API_URL`). When using Vite, these must use the `VITE_` prefix (`VITE_API_URL`) to be exposed to the client.
- The `docker-compose.yml` config for the frontend includes `stdin_open: true` and `tty: true`, which are specifically workarounds for Create React App in Docker. Vite requires running with the `--host` flag instead.