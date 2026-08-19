# Security Policy

## Supported version

The deployed website is built from the current reviewed `main` branch. Security fixes target `main` and are deployed through the normal static-site build and deployment process; the repository does not use a separate package or GitHub Release version line.

## Reporting a vulnerability

Use [GitHub private vulnerability reporting](https://github.com/X1pheR/hypershell-website/security/advisories/new) for suspected vulnerabilities or accidental sensitive-data exposure. Do not place credentials, access tokens, private topology, household information, internal hostnames/addresses or exploit details in a public issue.

If private vulnerability reporting is unexpectedly unavailable, open a public issue containing only enough non-sensitive information to request a private follow-up channel.

## Security and privacy boundary

Reports are especially relevant when they involve:

- exposure of private repository URLs or metadata that the public project catalog is intended to suppress;
- leakage of the GitHub metadata token used at build time;
- publication of internal topology, credentials, recovery material, household data or other content excluded by the public-content boundary;
- unsafe HTML/JavaScript generation from repository metadata;
- cross-site scripting, unsafe URL rendering or regressions in browser security behavior;
- dependency or workflow vulnerabilities that materially affect the test/build process.

The production website is static and has no Node.js runtime dependency. Browser-test dependencies exist only for repository acceptance. Build-time GitHub credentials are input-only and must never be written to the generated `dist/` output.

## Repository security

The repository uses exact test dependency versions with a committed npm lockfile, full-SHA-pinned GitHub Actions, repository-local browser and rendering tests, GitHub CodeQL default setup, Dependabot, Secret Scanning with Push Protection, Private Vulnerability Reporting and OpenSSF Scorecard.

These controls supplement rather than replace review of public content and the privacy boundary documented in `README.md`.
