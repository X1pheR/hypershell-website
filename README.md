# Hypershell Website

Static public website for `hypershell.eu` and `www.hypershell.eu`.

Hypershell is Ronald's personal homelab and connected home environment. The site presents its major domains, selected projects, simplified public architecture and visual identity without exposing internal topology or operational details.

## Design

The canonical, agent-readable design system is documented in [`DESIGN.md`](DESIGN.md) following the Google Labs DESIGN.md format.

- dark-only Hypershell neon branding;
- no runtime third-party dependencies;
- responsive one-page layout;
- semantic HTML and keyboard-visible focus states;
- reduced-motion support;
- custom branded 404 page;
- public architecture shows responsibilities, not endpoints.

## Repository layout

```text
hypershell-website/
├── DESIGN.md        # Canonical agent-readable design system
├── public/          # Static assets copied as-is
├── scripts/         # Build, test and deployment scripts
├── src/             # Authored HTML, CSS and JavaScript
├── tests/           # Repository-local Playwright acceptance tests
└── dist/            # Generated build output (ignored by Git)
```

## Build

```sh
./scripts/build.sh
```

The build has no package-manager or network dependency. It creates `dist/`, derives a content-based asset version and validates every required output asset.

## Test

```sh
./scripts/test.sh
```

Run the same suite against the deployed website with:

```sh
BASE_URL=https://www.hypershell.eu ./scripts/test.sh
```

Tests are project-specific and run in an ephemeral pinned Playwright container. The container installs its test-only packages in temporary storage and is removed after the run. No Playwright service remains running and the production site has no Node.js dependency.

The suite covers responsive layout, overflow, mobile navigation with and without JavaScript, keyboard focus restoration, mascot proportions, glitch lifecycle, project-card consistency, social metadata, the custom 404 response and WCAG A/AA checks through Axe.

## Deploy

```sh
./scripts/deploy.sh
```

The default target is:

```text
/srv/hypershell/sites/public/hypershell.eu
```

Deployment rebuilds the site, removes stale files from the target and copies the complete validated output. Historical timestamp backups are not retained; source rollback is handled through Git and a previous commit can be rebuilt and redeployed.

Caddy serves the target directory through its existing read-only bind mount. Static file updates do not require a Caddy restart.

## Content boundaries

Do not publish:

- internal IP addresses, ports or hostnames;
- credentials, tokens or recovery material;
- complete runtime topology;
- private family or household information;
- operational data that would materially help target the environment.
