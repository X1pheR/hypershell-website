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

The build has no package-manager dependency. It fetches current GitHub repository metadata at build time, renders selected Hypershell projects into the static site, creates `dist/`, derives a content-based asset version and validates every required output asset.

Live project discovery requires authenticated GitHub repository metadata access. The build accepts `GH_TOKEN` or `GITHUB_TOKEN`; alternatively it reads a protected token file from `GITHUB_TOKEN_FILE` or, by default, `.runtime-secrets/github-token` when that file exists. `.runtime-secrets/` is ignored by Git. The token is used only for the GitHub API request and is never written to `dist/`. A build fails if authenticated repository metadata cannot be retrieved.

A repository is included automatically when it is active and its GitHub **Website** field is exactly:

```text
https://www.hypershell.eu/#projects
```

Public repositories receive a GitHub link. Private repositories may expose their selected name, description and `PRIVATE` visibility label but never their repository URL. Selected repositories must have a non-empty GitHub description or the build fails. GitHub-backed project cards are sorted alphabetically by their display name; display-name exceptions live in `src/data/project-display-names.json`, otherwise the repository name is humanized. Non-GitHub projects remain supported through `src/data/manual-projects.json` and keep their declared order.

For deterministic tests or an explicitly pre-fetched metadata input, set `GITHUB_REPOSITORIES_FILE` to a JSON file with GitHub repository objects.

## Test

```sh
./scripts/test.sh
```

Run the same suite against the deployed website with:

```sh
BASE_URL=https://www.hypershell.eu ./scripts/test.sh
```

Tests are project-specific and run in an ephemeral pinned Playwright container. The container installs its test-only packages in temporary storage and is removed after the run. No Playwright service remains running and the production site has no Node.js dependency.

The suite covers project selection/rendering, responsive layout, overflow, mobile navigation with and without JavaScript, keyboard focus restoration, mascot proportions, glitch lifecycle, project-card consistency, social metadata, the custom 404 response and WCAG A/AA checks through Axe.

## Deploy

```sh
./scripts/deploy.sh
```

Set the deployment target explicitly through `TARGET_DIR`:

```sh
TARGET_DIR=/path/to/site ./scripts/deploy.sh
```

Deployment rebuilds the site, removes stale files from the target and copies the complete validated output. Historical timestamp backups are not retained; source rollback is handled through Git and a previous commit can be rebuilt and redeployed.

The production web server serves the deployed static files. Static file updates do not require an application runtime or server restart.

## Content boundaries

Do not publish:

- internal IP addresses, ports or hostnames;
- credentials, tokens or recovery material;
- complete runtime topology;
- private family or household information;
- operational data that would materially help target the environment.

## License

MIT. See [`LICENSE`](LICENSE).
