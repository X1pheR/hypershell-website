#!/usr/bin/env sh
set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
PLAYWRIGHT_IMAGE="${PLAYWRIGHT_IMAGE:-mcr.microsoft.com/playwright@sha256:5b8f294aff9041b7191c34a4bab3ac270157a28774d4b0660e9743297b697e48}"
PLAYWRIGHT_RESULTS_DIR="${PLAYWRIGHT_RESULTS_DIR:-$ROOT_DIR/test-results/browser}"

python3 -m unittest discover -s "$ROOT_DIR/tests" -p 'test_*.py' -v

GITHUB_REPOSITORIES_FILE="$ROOT_DIR/tests/github-repositories.fixture.json" \
  "$ROOT_DIR/scripts/build.sh"

command -v docker >/dev/null 2>&1 || {
  echo "Docker is required to run the browser test suite" >&2
  exit 1
}

mkdir -p "$PLAYWRIGHT_RESULTS_DIR"
rm -rf "$PLAYWRIGHT_RESULTS_DIR"/*

docker run --rm --init --ipc=host \
  --env "BASE_URL=${BASE_URL:-}" \
  --env "PLAYWRIGHT_OUTPUT_DIR=/test-results" \
  --volume "$ROOT_DIR:/work:ro" \
  --volume "$PLAYWRIGHT_RESULTS_DIR:/test-results" \
  --workdir /tmp/hypershell-website-tests \
  "$PLAYWRIGHT_IMAGE" \
  /bin/bash -lc '
    set -euo pipefail
    cp -a /work/tests/. .
    cp /work/package.json /work/package-lock.json .
    npm ci --silent --no-audit --no-fund
    SITE_ROOT=/work/dist npx playwright test --config=playwright.config.cjs
  '
