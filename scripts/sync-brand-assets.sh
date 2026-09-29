#!/usr/bin/env sh
set -eu
: "${BRAND_ROOT:?Set BRAND_ROOT to the accepted Hypershell brand workspace root}"
ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
IMAGE="mcr.microsoft.com/playwright@sha256:5b8f294aff9041b7191c34a4bab3ac270157a28774d4b0660e9743297b697e48"
docker run --rm --init --ipc=host \
  -e BRAND_ROOT=/brand -e REPO_ROOT=/work \
  -v "$ROOT_DIR:/work" -v "$BRAND_ROOT:/brand:ro" \
  -w /tmp/brand-assets "$IMAGE" /bin/bash -lc 'set -euo pipefail; cp /work/package.json /work/package-lock.json .; npm ci --silent --no-audit --no-fund; NODE_PATH=/tmp/brand-assets/node_modules node /work/scripts/derive_brand_assets.cjs'
