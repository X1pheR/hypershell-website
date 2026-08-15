#!/usr/bin/env sh
set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
PLAYWRIGHT_IMAGE="${PLAYWRIGHT_IMAGE:-mcr.microsoft.com/playwright:v1.61.1-noble}"

python3 -m unittest discover -s "$ROOT_DIR/tests" -p 'test_*.py' -v

GITHUB_REPOSITORIES_FILE="$ROOT_DIR/tests/github-repositories.fixture.json" \
  "$ROOT_DIR/scripts/build.sh"

command -v docker >/dev/null 2>&1 || {
  echo "Docker is required to run the browser test suite" >&2
  exit 1
}

docker run --rm --init --ipc=host \
  --env "BASE_URL=${BASE_URL:-}" \
  --volume "$ROOT_DIR:/work:ro" \
  --workdir /tmp/hypershell-website-tests \
  "$PLAYWRIGHT_IMAGE" \
  /bin/bash -lc '
    set -euo pipefail
    cp -a /work/tests/. .
    npm init --yes >/dev/null
    npm install --silent --no-audit --no-fund \
      @playwright/test@1.61.1 \
      @axe-core/playwright@4.10.2
    SITE_ROOT=/work/dist npx playwright test --config=playwright.config.cjs
  '
