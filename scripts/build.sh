#!/bin/sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
DIST_DIR="$ROOT_DIR/dist"

rm -rf "$DIST_DIR"
mkdir -p "$DIST_DIR"

cp "$ROOT_DIR/src/index.html" "$DIST_DIR/index.html"
cp "$ROOT_DIR/src/404.html" "$DIST_DIR/404.html"
cp "$ROOT_DIR/src/styles.css" "$DIST_DIR/styles.css"
cp "$ROOT_DIR/src/site.js" "$DIST_DIR/site.js"
cp -R "$ROOT_DIR/public/." "$DIST_DIR/"

for required_file in index.html 404.html styles.css site.js spiny.png dead-spiny.png me.jpg; do
  test -s "$DIST_DIR/$required_file" || {
    printf 'Build validation failed: missing or empty %s\n' "$required_file" >&2
    exit 1
  }
done

grep -q '<title>Hypershell' "$DIST_DIR/index.html"
grep -q 'prefers-reduced-motion' "$DIST_DIR/styles.css"

printf 'Built Hypershell website in %s\n' "$DIST_DIR"
