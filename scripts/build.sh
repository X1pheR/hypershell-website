#!/usr/bin/env sh
set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
DIST_DIR="$ROOT_DIR/dist"

rm -rf "$DIST_DIR"
mkdir -p "$DIST_DIR"

if [ -n "${GITHUB_REPOSITORIES_FILE:-}" ]; then
  python3 "$ROOT_DIR/scripts/render_projects.py" \
    --template "$ROOT_DIR/src/index.html" \
    --output "$DIST_DIR/index.html" \
    --manual "$ROOT_DIR/src/data/manual-projects.json" \
    --overrides "$ROOT_DIR/src/data/project-display-names.json" \
    --repositories-file "$GITHUB_REPOSITORIES_FILE"
else
  python3 "$ROOT_DIR/scripts/render_projects.py" \
    --template "$ROOT_DIR/src/index.html" \
    --output "$DIST_DIR/index.html" \
    --manual "$ROOT_DIR/src/data/manual-projects.json" \
    --overrides "$ROOT_DIR/src/data/project-display-names.json"
fi
cp "$ROOT_DIR/src/404.html" "$DIST_DIR/404.html"
cp "$ROOT_DIR/src/styles.css" "$DIST_DIR/styles.css"
cp "$ROOT_DIR/src/site.js" "$DIST_DIR/site.js"
cp -a "$ROOT_DIR/public/." "$DIST_DIR/"

ASSET_VERSION="$(cat "$ROOT_DIR/src/styles.css" "$ROOT_DIR/src/site.js" | sha256sum | awk '{print substr($1, 1, 12)}')"

for html_file in "$DIST_DIR/index.html" "$DIST_DIR/404.html"; do
  temporary_file="${html_file}.tmp"
  sed "s/__ASSET_VERSION__/$ASSET_VERSION/g" "$html_file" > "$temporary_file"
  mv "$temporary_file" "$html_file"
done

required_files="
index.html
404.html
styles.css
site.js
spiny.png
dead-spiny.png
homesight.svg
me.jpg
favicon.ico
favicon.svg
favicon-96x96.png
apple-touch-icon.png
site.webmanifest
web-app-manifest-192x192.png
web-app-manifest-512x512.png
robots.txt
sitemap.xml
social-card.svg
social-card.png
"

for relative_path in $required_files; do
  test -s "$DIST_DIR/$relative_path" || {
    echo "Missing required build output: $relative_path" >&2
    exit 1
  }
done

if grep -R "__ASSET_VERSION__" "$DIST_DIR"/*.html >/dev/null 2>&1; then
  echo "Unresolved asset version placeholder in build output" >&2
  exit 1
fi

find "$DIST_DIR" -type f -exec chmod 0644 {} +

printf 'Built %s with asset version %s\n' "$DIST_DIR" "$ASSET_VERSION"
