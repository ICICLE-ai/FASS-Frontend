# ADR 0001: Landing page with client-side routing for Franklin/Brown county selection

- **Status:** Proposed
- **Date:** 2026-06-17

## Context

FASS is deployed as two independent instances, one per county:

- **Franklin County** — production deployment at `https://feast.pods.icicleai.tapis.io/`
- **Brown County** — staging deployment at `https://fassfrontstage.pods.icicleai.tapis.io/`

Until now, each deployment dropped users directly into its simulation view at `/`. There was no shared entry point from which a user could choose which county to view, and the only way to switch was to manually edit the URL.

We want a single landing page that lets users pick a county and then routes them to the corresponding instance. Specifically:

- **Franklin County** button → the Franklin (prod) simulation on the same host as the landing page.
- **Brown County** button → the Brown (staging) deployment, which lives on a separate host.

Because Brown is a separate deployment, its button must be a cross-origin navigation. The Franklin button could be done either as a same-host link or a client-side route — the choice has implications for how the URL is structured and whether the page reloads.

## Decision

Use **client-side routing** to host both the landing page and the Franklin simulation on the same deployment under distinct paths.

- Add `react-router-dom` as a dependency.
- Mount `<Landing />` at `/`.
- Mount `<App />` (the simulation) at `/simulation`.
- The Franklin County button is a `<Link to="/simulation">` — same-host client-side navigation, no full page reload.
- The Brown County button remains a plain `<a href="…/staging URL">` — a real cross-origin navigation, since it points to a different deployment.

Supporting changes:

- `src/main.jsx`: wraps the app in `<BrowserRouter>` and declares the two routes.
- `src/Landing.jsx`: new component containing the two buttons.
- `index.html`: removed `class="container"` from `#root`. Tailwind's `.container` utility applies a max-width without horizontal auto-centering, which pinned the landing card to the left. `App.jsx` declares its own container internally, so removing the class on `#root` has no effect on the simulation view.
- `package.json`: adds `react-router-dom` to dependencies.
- `package-lock.json`: must be committed alongside `package.json`. Installing `react-router-dom` brings in the router itself plus several transitive dependencies; their exact resolved versions are recorded only in the lockfile, not in `package.json`'s loose `^7.x` range. Without committing the lockfile:
  - Teammates, CI, and the production build would each run `npm install` and could resolve to different versions of the router or its transitive dependencies.
  - Builds become non-reproducible — a green CI run no longer guarantees the same artifact as a local build.
  - Bugs introduced by a silent transitive bump become much harder to bisect.

  Standard practice is to always commit `package.json` and `package-lock.json` together in the same commit. This PR follows that rule.

No backend, nginx, or Dockerfile changes are required.

## Consequences

### Positive

- A single shared entry point exists for both counties.
- Navigating from Landing to the Franklin simulation is instant — no page reload, no remount of unrelated state.
- The simulation now lives at a distinct, bookmarkable path (`/simulation`) instead of `/`.
- Browser back/forward buttons work naturally between the landing and simulation views.
- The Franklin instance can be reached either by clicking the button or by deep-linking directly to `/simulation`.

### Neutral / things to be aware of

- Adds one runtime dependency (`react-router-dom`). Trivially small in this app's footprint, but it is a new dependency surface.
- The TopBar's `Navbar.Brand` link (`href="/"`) now navigates back to the landing page rather than reloading the simulation in place. This is probably desirable but is a behavior change worth flagging.
- Direct navigation to `/simulation` works in production because `nginx.conf` already serves `index.html` as a fallback (`try_files $uri $uri/ /index.html;`). If the SPA were ever served from a non-root base path, both Vite's `base` and the router's `basename` would need to be configured.

### Negative

- Two coexisting routes on the same deployment means the bundle for `<App />` is loaded even for users who only ever visit the landing page. This is a non-issue today (a single small build), but if the app grows, the Landing route could be code-split.

## Alternatives considered

### A) Same-host hard link to the prod URL

Have the Franklin button be a plain `<a href="https://feast.pods.icicleai.tapis.io/">`, symmetric with Brown's link.

- **Pros:** Simplest possible code; no new dependency; both buttons share the same shape.
- **Cons:** When the landing page is hosted on the *same* deployment as Franklin, clicking the button reloads the landing page itself (because `/` serves Landing, not the simulation). The only way to make this work would be to host the landing page on a separate third deployment — strictly more infrastructure than the routing approach. Rejected.

### B) In-app view toggle (no router, no URL change)

Use a `useState` flag in a `Root` wrapper to swap between `<Landing />` and `<App />` based on a button click.

- **Pros:** No new dependency; works without any nginx/deploy assumptions.
- **Cons:** The simulation has no URL of its own — it's not bookmarkable, deep-linkable, or distinguishable from the landing page in the browser history. The user's back button doesn't return them to the landing page. The Franklin instance does not "live on a distinct path," which was an explicit requirement. Rejected.

### C) Host the landing page on a separate deployment

Spin up a third deployment whose only job is the landing page, with both buttons being plain cross-origin links.

- **Pros:** Cleanest separation of concerns; both buttons treated identically.
- **Cons:** Adds deployment overhead (a third pod to provision, monitor, and keep in sync with URL changes) for a UI surface that is two buttons. Disproportionate to the value. Rejected for now, but remains a reasonable future option if the landing page grows non-trivially.

## References

- `src/Landing.jsx`
- `src/main.jsx`
- `index.html`
- `nginx.conf` — SPA fallback already in place via `try_files`
- `src/shared/client.js` — API base URL is environment-driven, so routing changes do not affect the backend contract
