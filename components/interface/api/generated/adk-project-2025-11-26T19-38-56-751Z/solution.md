ISSUES FOUND:
- The frontend project uses `react-scripts` (Create React App), which is forbidden by the strict review guidelines ("REJECT if using Vue CLI or create-react-app without Vite"). You MUST use Vite for the React frontend.
- `package.json` dependencies are outdated/incorrect for a modern React setup: Remove `react-scripts`. Add `vite` and `@vitejs/plugin-react`.
- Missing `vite.config.js` configuration file.
- `index.html` is in `public/` but for Vite it should generally be in the project root (or configured otherwise) and MUST contain the entry point script tag (e.g., `<script type="module" src="/src/index.js"></script>`).
- The `start` script in `package.json` relies on `react-scripts`. It should use `vite` (e.g., `"dev": "vite --port 4000 --host"`).
- Frontend `Dockerfile` uses `npm start` which typically runs `react-scripts start`. It needs to be updated to run the Vite development server (e.g., `npm run dev`).