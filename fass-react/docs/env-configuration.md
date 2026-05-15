# Environment-Based API Configuration

## The Problem

Previously, `client.js` had multiple `baseURL` lines with different URLs for each environment (local, staging, production). Deploying to a different environment meant manually commenting/uncommenting the right line and committing the change. This was error-prone: PR #30 accidentally shipped a localhost URL to the staging branch.

```js
// What client.js used to look like
export const client = axios.create({
    // baseURL: 'http://127.0.0.1:8000/api'          // local
    // baseURL: 'https://fassbackstage...tapis.io/api' // staging
    baseURL: 'https://fassback...tapis.io/api'         // prod  <-- had to toggle these manually
});
```

## The Solution

We use Vite's built-in environment variable system. The API URL is defined once per environment in `.env` files, and Vite bakes the correct value into the JavaScript output files at build time.

### How it works, step by step

```
1. Developer pushes to `staging` branch
2. GitHub Action triggers, sees branch = staging
3. GH Action passes `VITE_MODE=staging` as a Docker build argument
4. Dockerfile runs `npm run build -- --mode staging`
5. Vite reads `.env.staging`, which has:
      VITE_API_BASE_URL=https://fassbackstage.pods.icicleai.tapis.io/api
6. Every `import.meta.env.VITE_API_BASE_URL` in the source code
   gets replaced with that literal string in the output JS files
7. The built static files are copied into the nginx container
8. At runtime, the app hits the staging backend -- no env vars needed on the pod
```

The same flow applies for `main` (production mode) and local dev.

### Key concept: build-time, not runtime

Vite's `import.meta.env` variables are resolved when `vite build` runs, not when the app loads in the browser. The `.env` files do not need to exist in the running container. By the time nginx serves the JS files, the URL is already a hardcoded string in the JS files.

This is different from how backend frameworks (Django, Express) handle env vars at runtime. For a frontend single-page application like this one, the values are frozen at build time.

## File Overview

### `.env` files (in `fass-react/`)

| File               | When it's used                        | URL                                                  |
|--------------------|---------------------------------------|------------------------------------------------------|
| `.env.development` | `npm run dev` (local)                 | `http://127.0.0.1:8000/api`                          |
| `.env.staging`     | `npm run build -- --mode staging`     | `https://fassbackstage.pods.icicleai.tapis.io/api`   |
| `.env.production`  | `npm run build` (default)             | `https://fassback.pods.icicleai.tapis.io/api`        |
| `.env.example`     | Reference for new developers          | (empty placeholder)                                  |

Vite automatically loads the `.env` file that matches the current mode. The `--mode` flag controls which file is read.

### `client.js`

```js
export const client = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
});
```

That's it. No commented-out URLs, no manual toggling. Vite replaces `import.meta.env.VITE_API_BASE_URL` with the value from the active `.env` file.

All variables exposed to the frontend must be prefixed with `VITE_`. This is a Vite security feature. Variables without the prefix are not included in the built output, so backend-only secrets in `.env` files won't leak into the frontend.

### `Dockerfile`

```dockerfile
ARG VITE_MODE=production
RUN npm run build -- --mode ${VITE_MODE}
```

The `ARG` accepts a build argument passed in by the GitHub Action (or anyone running `docker build`). It defaults to `production` so that a plain `docker build` without any arguments still works.

### `build-push-deploy.yml` (GitHub Action)

**This is the critical piece that ties everything together.** The GitHub Action is what makes the environment selection automatic. When code is pushed, the action inspects which branch triggered the build and passes the corresponding `VITE_MODE` to Docker. Without this, the Dockerfile defaults to `production` regardless of branch, and the `.env` files would have no effect in CI.

```yaml
build-args: |
  VITE_MODE=${{ github.ref == 'refs/heads/staging' && 'staging' || 'production' }}
```

The full flow, per branch:

| Branch pushed to | GH Action sets         | Dockerfile runs                        | Vite reads          | API URL baked in                                     |
|------------------|------------------------|----------------------------------------|---------------------|------------------------------------------------------|
| `staging`        | `VITE_MODE=staging`    | `npm run build -- --mode staging`      | `.env.staging`      | `https://fassbackstage.pods.icicleai.tapis.io/api`   |
| `main`           | `VITE_MODE=production` | `npm run build -- --mode production`   | `.env.production`   | `https://fassback.pods.icicleai.tapis.io/api`        |

**You do not need to change `client.js` or any source code when deploying to a different environment.** The branch you push to determines which backend URL ends up in the build. This is the whole point of the setup: pushing to `staging` automatically builds against the staging backend, and pushing to `main` automatically builds against the production backend.

## Common Tasks

### Adding a new environment variable

1. Add it to each `.env.*` file with the appropriate value per environment
2. Add the key (with empty value) to `.env.example`
3. Reference it in code as `import.meta.env.VITE_YOUR_VARIABLE`
4. Prefix the variable name with `VITE_` or it won't be available in the frontend

### Running locally

```bash
cd fass-react
npm run dev           # uses .env.development (localhost backend)
npm run dev:staging   # uses .env.staging (staging backend)
```

### Testing a production build locally

```bash
npm run build         # uses .env.production
npm run preview       # serves the built files locally
```

### Debugging: "my API calls go to the wrong URL"

1. Check which mode is active: add `console.log(import.meta.env.VITE_API_BASE_URL)` temporarily
2. Verify the correct `.env` file exists and has the right value
3. Restart the dev server (Vite caches env vars; changes require a restart)
4. For Docker builds: check that `VITE_MODE` is passed correctly in the GH Action or `docker build` command
