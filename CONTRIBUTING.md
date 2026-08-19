# Contributing

This repository owns the public static Hypershell website. Keep changes focused on public presentation, build/render behavior, accessibility, browser behavior and the deliberately simplified public project/architecture view.

## Content boundary

Do not add:

- internal IP addresses, ports, private hostnames or complete runtime topology;
- credentials, tokens, keys, recovery material or secret references;
- private family, household or operational information;
- private repository URLs that the catalog intentionally suppresses.

Repository metadata consumed by the project renderer is untrusted input and must remain safely escaped and bounded by the existing selection rules.

## Validation

Run the maintained test entry point:

```sh
./scripts/test.sh
```

The suite covers deterministic project rendering and the Playwright/Axe browser acceptance contract. It uses the committed test dependency lock and an ephemeral digest-pinned Playwright container; the production website itself has no Node.js runtime dependency.

Changes to GitHub Actions must keep external Actions pinned to full commit SHAs. Changes to test dependencies must update `package-lock.json` consistently.

## Pull requests

Keep pull requests focused. Explain whether a change affects public content/privacy, project rendering, accessibility, responsive behavior, visual design, build/deployment behavior or testing. A green CI run and CodeQL result are required but do not replace review of the public-content boundary.

Security-sensitive reports must follow `SECURITY.md` instead of a public issue or pull request.
