ISSUES FOUND:
- The project uses `react-scripts` (Create React App) which is forbidden by the strict review guidelines. You must use **Vite** for React projects.
- `package.json` contains `react-scripts` and lacks `vite` and `@vitejs/plugin-react`.
- Missing `vite.config.js` configuration file.
- `index.html` is located in `public/` (CRA pattern) instead of the project root (Vite pattern).
- `index.html` lacks the standard Vite entry point script tag (e.g., `<script type="module" src="/src/index.js"></script>`).
- The frontend `Dockerfile` and `docker-compose.yml` interact with `npm start` which triggers `react-scripts start`. This needs to be updated to support a Vite development server (usually `vite` or `vite --host`).