ISSUES FOUND:
- The frontend is configured using `react-scripts` (Create React App), which is deprecated and strictly forbidden by the "REJECT if using create-react-app" rule. You must use **Vite** for the React application.
- Missing `vite.config.js` configuration file, which is required for React+Vite projects.
- The `package.json` dependencies include `react-scripts` instead of `vite` and `@vitejs/plugin-react`.
- The frontend file structure places `index.html` inside `public/` (CRA structure). For Vite, `index.html` must be in the `frontend/` root directory and must utilize `<script type="module" src="/src/index.jsx">`.
- The Frontend `Dockerfile` copies build artifacts from `/app/build`. When switching to Vite, the default output directory is `/app/dist`, so the Dockerfile COPY command and Nginx configuration must be updated to match.
- The `index.js` file (and reference in HTML) uses `.js` extension; Vite projects typically use `.jsx` for files containing JSX, though `.js` can work if configured, standard practice is `.jsx`.