ISSUES FOUND:
- The frontend project uses `create-react-app` (`react-scripts`) which is deprecated and violates the requirement to not use CRA without Vite. You must use **Vite** for the React application.
- `package.json` includes `react-scripts` instead of `vite` and `@vitejs/plugin-react`.
- Missing `vite.config.js` configuration file.
- `index.html` is located in `public/index.html`. For Vite, it must be in the `frontend` root directory and include the `<script type="module" src="/src/index.js"></script>` entry point.
- Hardcoded API URL `http://localhost:8000/next-runs` found in `src/App.js`. For production readiness, this must be configurable via environment variables (e.g., `import.meta.env.VITE_API_URL`).
- The frontend `Dockerfile` uses `npm start` which typically maps to `react-scripts start`. For Vite, this should likely be `npm run dev` (with `--host` exposed) for development or a multi-stage build serving the `dist` folder for production.
- `docker-compose.yml` relies on the CRA default port 3000 and behavior. Vite defaults to 5173 (though configurable). Ensure ports match the new Vite configuration.