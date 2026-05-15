# FASS Frontend Deployment

This document describes how the FASS frontend gets from source code on GitHub to a running application accessible on the web.

## Architecture Overview

The FASS frontend is a React application built with Vite. It is deployed as static files served by nginx inside a Docker container, running on ICICLE's Tapis Pods infrastructure.

```
GitHub repo
  |
  |  (push to staging or main)
  v
GitHub Action (build-push-deploy.yml)
  |
  |  1. Builds Docker image (with Vite compiling the React app)
  |  2. Pushes image to GitHub Container Registry (ghcr.io)
  |  3. Restarts the appropriate Tapis pod
  v
Tapis Pod pulls new image from ghcr.io and starts serving
```

## Environments

| Environment | Branch    | Backend API URL                                         | Tapis Pod Variable   | Docker Image Tag |
|-------------|-----------|----------------------------------------------------------|----------------------|------------------|
| Production  | `main`    | `https://fassback.pods.icicleai.tapis.io/api`           | `vars.POD_ID`        | `latest`         |
| Staging     | `staging` | `https://fassbackstage.pods.icicleai.tapis.io/api`     | `vars.STAGE_POD_ID`  | `staging`        |
| Dev         | `dev`     | (not currently configured for env-based builds)          | `vars.DEV_POD_ID`    | `dev`            |
| Local       | any       | `http://127.0.0.1:8000/api`                             | N/A                  | N/A              |

## Branch Workflow

```
feature branches
       |
       v
  Brown-County-Frontend (or similar integration branch)
       |
       v  (PR merge)
    staging  ------>  triggers build + deploy to staging pod
       |
       v  (PR merge, after validation)
     main  -------->  triggers build + deploy to production pod
```

Feature branches do not trigger any deployments. Only pushes to `staging`, `main`, or `release-*` branches trigger the GitHub Action.

## What Happens on Push (Step by Step)

When code is pushed to `staging` or `main`, the GitHub Action at `.github/workflows/build-push-deploy.yml` runs. Here is what each step does:

### 1. Determine the Docker image tag

The action derives a tag from the branch name:
- `main` becomes `latest`
- `staging` stays `staging`
- `release-1.2.0` becomes `1.2.0` (the `release-` prefix is stripped)

### 2. Check out the code

Standard `actions/checkout` to get the repo contents.

### 3. Log in to GitHub Container Registry

Uses credentials stored in GitHub repo variables/secrets:
- `vars.REGISTRY_USERNAME` -- the Docker/GHCR username
- `secrets.REGISTRY_TOKEN` -- the authentication token

### 4. Build the Docker image

This is where the frontend is compiled. The action runs `docker build` with:
- **Context:** `./fass-react` (the frontend directory)
- **Dockerfile:** `./fass-react/Dockerfile`
- **Build argument:** `VITE_MODE=staging` or `VITE_MODE=production` (based on branch)

Inside the Dockerfile, the build happens in two stages:

**Stage 1 (build-stage):** A Node.js container installs dependencies and runs `npm run build -- --mode ${VITE_MODE}`. Vite reads the matching `.env` file (e.g., `.env.staging`) and replaces all `import.meta.env.VITE_API_BASE_URL` references in the source code with the actual URL string. The output is a set of static HTML, CSS, and JS files in `/app/dist`.

**Stage 2 (prod-stage):** A lightweight nginx container copies the built static files from Stage 1 into `/usr/share/nginx/html` and copies the `nginx.conf` configuration.

### 5. Push the image to GHCR

The built image is pushed to `ghcr.io/icicle-ai/fass-front:<tag>`.

### 6. Restart the Tapis pod

After the image is pushed, the action sends a restart request to the appropriate Tapis pod via the Tapis API:

- **Staging:** `https://icicleai.tapis.io/v3/pods/${STAGE_POD_ID}/restart`
- **Production:** `https://icicleai.tapis.io/v3/pods/${POD_ID}/restart`
- **Dev:** `https://icicleai.tapis.io/v3/pods/${DEV_POD_ID}/restart`

The pod pulls the latest image for its tag from GHCR and starts a new container. Authentication uses `secrets.TAPIS_ICICLE_PROD_TOKEN`.

## How the API URL Gets Into the App

The backend API URL is not configured at runtime. It is baked into the JavaScript files at build time by Vite.

```
.env.staging                              client.js (source)
VITE_API_BASE_URL=https://...  --->  import.meta.env.VITE_API_BASE_URL

                    |  (vite build --mode staging)
                    v

              client.js (built output)
              baseURL: "https://fassbackstage.pods.icicleai.tapis.io/api"
```

The `.env` files live in `fass-react/`:

| File               | Used when                             | Contains                                              |
|--------------------|---------------------------------------|-------------------------------------------------------|
| `.env.development` | `npm run dev` (local development)     | `http://127.0.0.1:8000/api`                           |
| `.env.staging`     | `npm run build -- --mode staging`     | `https://fassbackstage.pods.icicleai.tapis.io/api`    |
| `.env.production`  | `npm run build` (default)             | `https://fassback.pods.icicleai.tapis.io/api`         |
| `.env.example`     | Reference for new developers          | (empty)                                               |

To add a new environment variable: add it to each `.env.*` file, add the key to `.env.example`, and reference it in code as `import.meta.env.VITE_YOUR_VARIABLE`. The variable name must start with `VITE_` or Vite will not include it in the build.

## The Docker Image

The final Docker image contains:
- nginx (serving on port 80)
- The compiled static files (HTML, CSS, JS) in `/usr/share/nginx/html`
- The nginx configuration from `fass-react/nginx.conf`

The nginx config:
- Serves the static files from `/usr/share/nginx/html`
- Routes all paths to `index.html` (standard single-page app routing via `try_files`)
- Provides a `/health` endpoint that returns 200 (used by Tapis for health checks)

There is no Node.js, no npm, and no source code in the final image. Only the compiled output and nginx.

## GitHub Secrets and Variables

These are configured in the GitHub repo settings under Settings > Secrets and variables > Actions.

**Secrets (sensitive):**
- `REGISTRY_TOKEN` -- token for authenticating with GHCR
- `TAPIS_ICICLE_PROD_TOKEN` -- token for calling the Tapis API to restart pods

**Variables (non-sensitive):**
- `REGISTRY_USERNAME` -- GHCR username
- `POD_ID` -- Tapis pod ID for production
- `STAGE_POD_ID` -- Tapis pod ID for staging
- `DEV_POD_ID` -- Tapis pod ID for dev

## Running Locally

```bash
cd fass-react
npm install
npm run dev             # starts dev server, hits localhost:8000 backend
npm run dev:staging     # starts dev server, hits staging backend
```

To test a production-like build locally:

```bash
npm run build           # builds with .env.production
npm run preview         # serves the built files on a local port
```

To build the Docker image locally:

```bash
cd fass-react
docker build -t fass-front .                                    # production mode (default)
docker build --build-arg VITE_MODE=staging -t fass-front .      # staging mode
docker run -p 8080:80 fass-front                                # access at http://localhost:8080
```

## Troubleshooting

**App hits the wrong backend URL:**
The URL is frozen at build time. Check which `.env` file was used during the build. For Docker builds, verify the `VITE_MODE` build argument. For local dev, restart the dev server after changing `.env` files.

**GitHub Action fails at the Docker build step:**
Check that the `.env` files exist on the branch being built. The action builds from the branch that was pushed, so the `.env` files must be committed on that branch.

**GitHub Action fails at the pod restart step:**
Verify that `TAPIS_ICICLE_PROD_TOKEN` is still valid (tokens expire). Check the Tapis pod ID variables match the actual pods.

**Pod restarts but shows old version:**
The pod pulls the image by tag (e.g., `staging`). Verify the image was pushed to GHCR with the correct tag. Check the GitHub Action logs for the push step.

**Changes on a feature branch don't deploy:**
Only `staging`, `main`, and `release-*` branches trigger the GitHub Action. Merge your feature branch into `staging` first.
