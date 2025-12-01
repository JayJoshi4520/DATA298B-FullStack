ISSUES FOUND:
- The frontend project uses `react-scripts` (Create React App), which is considered outdated/legacy. Strict production standards require using **Vite** for new React projects (`"vite": "^5.0.0"`).
- `frontend/package.json` is missing `vite` and `@vitejs/plugin-react` dependencies, and retains `react-scripts`.
- Missing `frontend/vite.config.js` configuration file.
- `frontend/public/index.html` follows the Create React App structure. For Vite, `index.html` must be in the **frontend root** (`frontend/index.html`) and must not use `%PUBLIC_URL%`.
- `frontend/index.html` is missing the module entry point script tag (e.g., `<script type="module" src="/src/index.jsx"></script>`).
- Environment variables in `App.js` and `docker-compose.yml` use the CRA pattern (`REACT_APP_` / `process.env`). Vite requires variables to start with `VITE_` and be accessed via `import.meta.env`.
- Frontend files containing JSX (`App.js`, `StatusCard.js`, etc.) should typically use the `.jsx` extension in a Vite environment for proper esbuild processing.
- The Frontend Dockerfile `CMD ["npm", "start"]` combined with `package.json` scripts implies a CRA dev server. For Vite, this should run the Vite dev server with host exposure (`vite --host`) or serve a production build.