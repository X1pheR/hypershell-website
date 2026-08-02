#!/bin/sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
TARGET_DIR=${1:-/srv/hypershell/sites/public/hypershell.eu}
BACKUP_ROOT=${2:-/srv/hypershell/backups/hypershell-website}
STAMP=$(date -u +%Y%m%dT%H%M%SZ)
BACKUP_DIR="$BACKUP_ROOT/$STAMP"

"$ROOT_DIR/scripts/build.sh"

mkdir -p "$TARGET_DIR" "$BACKUP_DIR"
if find "$TARGET_DIR" -mindepth 1 -maxdepth 1 | grep -q .; then
  cp -a "$TARGET_DIR/." "$BACKUP_DIR/"
fi

# Copy the complete new release first so the active site always keeps an index and error page.
cp -R "$ROOT_DIR/dist/." "$TARGET_DIR/"

# Remove assets that belonged only to the retired v1 website.
for obsolete_file in \
  "404 - Copy.html" \
  "404_caveman.gif" \
  "background.png" \
  "custom-authelia.css" \
  "dark.css" \
  "diagram.png" \
  "light.css" \
  "mgGlitch.js" \
  "mgGlitch.min.js" \
  "spiny (Custom).png" \
  "spiny-glitch.png" \
  "spiny_dead.png"; do
  rm -f "$TARGET_DIR/$obsolete_file"
done

for required_file in index.html 404.html styles.css site.js spiny.png dead-spiny.png me.jpg; do
  test -s "$TARGET_DIR/$required_file" || {
    printf 'Deployment validation failed: missing or empty %s\n' "$required_file" >&2
    exit 1
  }
done

grep -q 'Spiny-powered homelab' "$TARGET_DIR/index.html"
grep -q 'You hit a dead shell' "$TARGET_DIR/404.html"

printf 'Deployed Hypershell website to %s\n' "$TARGET_DIR"
printf 'Rollback copy: %s\n' "$BACKUP_DIR"
