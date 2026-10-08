#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
DIST_DIR="$ROOT_DIR/dist"
SITE_DIR="/srv/hypershell/runtime/sites/public/hypershell.eu"
HOME_SITE_DIR="${HOME_SITE_DIR:-$SITE_DIR}"
OCI_SITE_DIR="${OCI_SITE_DIR:-$SITE_DIR}"
OCI_SSH_TARGET="${OCI_SSH_TARGET:-oci-vps}"

# The public site is OCI-owned; the Home copy supports local recovery and the
# wildcard 404 route. Both consume the exact same validated static build.
# The top-level tmp/ directory is runtime state and must survive publication.
RSYNC_ARGS=(--archive --checksum --delay-updates --delete --exclude='/tmp/***')
SSH_ARGS=(-o BatchMode=yes -o StrictHostKeyChecking=yes)

verify_target() {
  local name="$1" target="$2" delta
  delta="$(rsync "${RSYNC_ARGS[@]}" --dry-run --itemize-changes "$DIST_DIR/" "$target/")"
  if [[ -n "$delta" ]]; then
    printf '%s verification failed; remaining differences:\n%s\n' "$name" "$delta" >&2
    return 1
  fi
  printf '%s verified against accepted build\n' "$name"
}

printf '%s\n' 'Building one publication artifact...'
"$ROOT_DIR/scripts/build.sh"
test -s "$DIST_DIR/index.html"
test -s "$DIST_DIR/404.html"
if ! grep -q 'data-project-filter="kind:mcp-server"' "$DIST_DIR/index.html"; then
  echo 'MCP kind filter is absent from the publication candidate' >&2
  exit 1
fi
build_hash="$(cd "$DIST_DIR" && find . -type f -print0 | sort -z | xargs -0 sha256sum | sha256sum | cut -d ' ' -f1)"
printf 'Release content SHA256: %s\n' "$build_hash"

# Validate connection and target directories before writing to either site.
test -d "$HOME_SITE_DIR"
ssh "${SSH_ARGS[@]}" "$OCI_SSH_TARGET" "test -d '$OCI_SITE_DIR'"

printf '%s\n' 'Publishing complete validated build to OCI (public origin)...'
rsync "${RSYNC_ARGS[@]}" -e "ssh -o BatchMode=yes -o StrictHostKeyChecking=yes" "$DIST_DIR/" "$OCI_SSH_TARGET:$OCI_SITE_DIR/"
verify_target 'OCI' "$OCI_SSH_TARGET:$OCI_SITE_DIR"

printf '%s\n' 'Publishing identical validated build to Home (local recovery and wildcard 404)...'
rsync "${RSYNC_ARGS[@]}" "$DIST_DIR/" "$HOME_SITE_DIR/"
verify_target 'Home' "$HOME_SITE_DIR"

printf 'Dual-site publication completed; release SHA256: %s\n' "$build_hash"
