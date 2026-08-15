#!/usr/bin/env sh
set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
DIST_DIR="$ROOT_DIR/dist"
TARGET_DIR="${TARGET_DIR:?TARGET_DIR is required}"

"$ROOT_DIR/scripts/build.sh"

mkdir -p "$TARGET_DIR"
find "$TARGET_DIR" -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +
find "$DIST_DIR" -mindepth 1 -maxdepth 1 -exec cp -a -- {} "$TARGET_DIR/" \;
find "$TARGET_DIR" -type f -exec chmod 0644 {} +

printf 'Deployed %s to %s\n' "$DIST_DIR" "$TARGET_DIR"
