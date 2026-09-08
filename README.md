# Hypershell Website

[![OpenSSF Scorecard](https://api.scorecard.dev/projects/github.com/X1pheR/hypershell-website/badge)](https://scorecard.dev/viewer/?uri=github.com/X1pheR/hypershell-website)

Static public website for `hypershell.eu` and `www.hypershell.eu`.

Hypershell is Ronald's personal homelab and connected home environment. The site presents its major domains, design rationale, simplified public architecture, core initiatives and maintained software without exposing internal topology or operational details.

## Design

The canonical, agent-readable design system is documented in [`DESIGN.md`](DESIGN.md) following the Google Labs DESIGN.md format.

- dark-only Hypershell neon branding;
- no runtime third-party dependencies;
- responsive homepage plus generated static project detail pages;
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

The production build has no package-manager dependency. It fetches current GitHub repository metadata and latest public releases at build time, renders the homepage plus static project detail pages, generates the only published sitemap from current project metadata, creates `dist/`, derives a content-based asset version and validates every required output asset and the `security.txt` expiry horizon.

Live project discovery requires authenticated GitHub repository metadata access. The build accepts `GH_TOKEN` or `GITHUB_TOKEN`; alternatively it reads a protected token file from `GITHUB_TOKEN_FILE` or, by default, `.runtime-secrets/github-token` when that file exists. `.runtime-secrets/` is ignored by Git. The token is used only for the GitHub API request and is never written to `dist/`. A build fails if authenticated repository metadata cannot be retrieved.

A repository is included automatically when it is active and its GitHub **Website** field is exactly:

```text
https://www.hypershell.eu/#projects
```

The homepage flows from the lab domains through **Why Hypershell** and the simplified public architecture before reaching Projects. The Projects section renders non-GitHub work from `src/data/manual-projects.json` as **Core initiatives** and selected repositories as **Maintained software**. Dynamic counts are derived at build time for the six public domains, core initiatives, maintained repositories and combined project total. Public repositories receive an explicit GitHub link. Private repositories may expose their selected name, description and neutral `PRIVATE` visibility label but never their repository URL. Repository visibility is metadata, not lifecycle status. Selected repositories must have a non-empty GitHub description or the build fails.

GitHub remains the source for repository name, description, visibility, URL and public release/update timestamps. `src/data/project-presentation.json` is the single local presentation owner for safe categories, display-name exceptions, explicit includes, presentation order, provenance labels and activity exclusions; it does not duplicate GitHub descriptions or URLs. Every core initiative and maintained repository receives a stable homepage fragment and a generated `/projects/<slug>/` detail page. Private repository URLs and private activity are never emitted. Recent activity prefers the latest public GitHub Release and falls back to repository update time; the website repository is excluded from this block to avoid self-referential noise.

For deterministic tests or explicitly pre-fetched metadata, set `GITHUB_REPOSITORIES_FILE` to a JSON file with GitHub repository objects and optionally `GITHUB_RELEASES_FILE` to a mapping of repository names to release objects.

### Brand derivatives

The accepted H-core masterbrand is used for official website identity; Spiny remains the mascot and homepage/404 personality layer. Web-specific PNG/ICO/WebP/JPEG derivatives are generated from accepted sources without modifying the canonical brand workspace:

```sh
BRAND_ROOT=/path/to/hypershell-brand ./scripts/sync-brand-assets.sh
```

`src/data/brand-assets.json` records the accepted source paths and hashes used for those derivatives. This maintenance step uses the repository's digest-pinned Playwright image, but the resulting production website has no Node.js or browser runtime dependency.

## Feedback and contributions

Use [GitHub Issues](https://github.com/X1pheR/hypershell-website/issues) for non-sensitive bugs and focused proposals and pull requests for changes. See [CONTRIBUTING.md](CONTRIBUTING.md) for the public-content boundary, development workflow and validation expectations. Security-sensitive reports must follow the private process in [SECURITY.md](SECURITY.md).

## Test

```sh
./scripts/test.sh
```

Run the same suite against the deployed website with:

```sh
BASE_URL=https://www.hypershell.eu ./scripts/test.sh
```

Tests are project-specific and run in an ephemeral digest-pinned Playwright container. The container installs its test-only packages from the committed npm lockfile into temporary storage and is removed after the run. No Playwright service remains running and the production site has no Node.js dependency.

GitHub CI runs the same repository test entry point. Browser-test dependencies are locked, Dependabot tracks npm and GitHub Actions updates, external Actions are pinned to full commit SHAs, GitHub CodeQL default setup scans the maintained JavaScript/Python/workflow source, and OpenSSF Scorecard publishes an independent repository-security signal.

The suite covers project selection/rendering, consolidated presentation metadata, provenance, generated detail pages and sitemap, release-first public activity, dynamic counts/categories/filtering, responsive layout and sticky mobile filters, overflow, mobile navigation with and without JavaScript, retained dashboard/mobile-blur contracts, keyboard focus restoration, brand/mascot delivery, intermittent hero glitch lifecycle, manifest/security/structured metadata, project-card consistency, social metadata, the custom 404 response and WCAG A/AA checks through Axe.

The public asset set includes a dark Hypershell web-app manifest and `/.well-known/security.txt`. The favicon and installable-app icon set is derived from the accepted H-core masterbrand; the previous SVG wrapper around an embedded raster image is intentionally not published. The hero prefers an optimized Spiny WebP derivative with PNG fallback, and social metadata uses an optimized 1200×630 JPEG derivative.

## Deploy

```sh
./scripts/deploy.sh
```

Set the deployment target explicitly through `TARGET_DIR`:

```sh
TARGET_DIR=/path/to/site ./scripts/deploy.sh
```

Deployment rebuilds the site, removes stale publication files from the target and copies the complete validated output. A top-level `tmp/` directory is deliberately preserved because deployment may provide that subtree as short-lived HTTPS egress staging for the filesystem MCP; it is runtime state, not website source or build output. Historical timestamp backups are not retained; source rollback is handled through Git and a previous commit can be rebuilt and redeployed.

The production web server serves the deployed static files. Static file updates do not require an application runtime or server restart.

## Repository and deployment lifecycle

The website is versioned through Git history rather than a package or GitHub Release line. `main` is the reviewed source branch; deployment rebuilds the validated static site from an accepted source revision. GitHub Releases and artifact provenance are therefore not a second publication boundary for this repository.

Repository security uses protected-branch CI/CodeQL gates, Dependabot, Secret Scanning with Push Protection and GitHub Private Vulnerability Reporting. Deployment credentials and runtime-specific targets remain outside the public source.

## Content boundaries

Do not publish:

- internal IP addresses, ports or hostnames;
- credentials, tokens or recovery material;
- complete runtime topology;
- private family or household information;
- operational data that would materially help target the environment.

## License

MIT. See [`LICENSE`](LICENSE).
