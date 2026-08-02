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
├── public/          # Static assets copied as-is
├── scripts/         # Build and deployment scripts
├── src/             # Authored HTML, CSS and JavaScript
└── dist/            # Generated build output (ignored by Git)
```

## Build

```sh
./scripts/build.sh
```

The build has no package-manager or network dependency. It creates `dist/` and validates the required output files.

## Deploy

```sh
./scripts/deploy.sh
```

The default target is:

```text
/srv/hypershell/sites/public/hypershell.eu
```

Before deployment, the current site is copied to a timestamped rollback directory under:

```text
/srv/hypershell/backups/hypershell-website/
```

Caddy serves the target directory through its existing read-only bind mount. Static file updates do not require a Caddy restart.

## Content boundaries

Do not publish:

- internal IP addresses, ports or hostnames;
- credentials, tokens or recovery material;
- complete runtime topology;
- private family or household information;
- operational data that would materially help target the environment.
