#!/usr/bin/env sh
set -eu
ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
DIST_DIR="$ROOT_DIR/dist"
rm -rf "$DIST_DIR"; mkdir -p "$DIST_DIR"
cp "$ROOT_DIR/src/404.html" "$DIST_DIR/404.html"
cp "$ROOT_DIR/src/styles.css" "$DIST_DIR/styles.css"
cp "$ROOT_DIR/src/site.js" "$DIST_DIR/site.js"
cp -a "$ROOT_DIR/public/." "$DIST_DIR/"
ARGS="--template $ROOT_DIR/src/index.html --project-template $ROOT_DIR/src/project.html --output $DIST_DIR/index.html --output-dir $DIST_DIR --manual $ROOT_DIR/src/data/manual-projects.json --presentation $ROOT_DIR/src/data/project-presentation.json"
if [ -n "${GITHUB_REPOSITORIES_FILE:-}" ]; then
  set -- $ARGS --repositories-file "$GITHUB_REPOSITORIES_FILE"
  [ -z "${GITHUB_RELEASES_FILE:-}" ] || set -- "$@" --releases-file "$GITHUB_RELEASES_FILE"
  python3 "$ROOT_DIR/scripts/render_projects.py" "$@"
else
  TOKEN_FILE="${GITHUB_TOKEN_FILE:-$ROOT_DIR/.runtime-secrets/github-token}"
  if [ -r "$TOKEN_FILE" ]; then python3 "$ROOT_DIR/scripts/render_projects.py" $ARGS --token-file "$TOKEN_FILE"; else python3 "$ROOT_DIR/scripts/render_projects.py" $ARGS; fi
fi
ASSET_VERSION="$(cat "$ROOT_DIR/src/styles.css" "$ROOT_DIR/src/site.js" | sha256sum | awk '{print substr($1,1,12)}')"
find "$DIST_DIR" -name '*.html' -type f -exec sh -c 'for html_file do temporary_file="${html_file}.tmp"; sed "s/__ASSET_VERSION__/'"$ASSET_VERSION"'/g" "$html_file" > "$temporary_file"; mv "$temporary_file" "$html_file"; done' sh {} +
required_files="index.html 404.html styles.css site.js spiny.png spiny.webp masterbrand-96.png homesight.svg me.jpg favicon.ico favicon-96x96.png apple-touch-icon.png site.webmanifest .well-known/security.txt web-app-manifest-192x192.png web-app-manifest-512x512.png robots.txt sitemap.xml social-card.png social-card.jpg vendor/powerglitch-2.5.0.min.js vendor/powerglitch-LICENSE.txt fonts/oxanium-700-latin-v21.woff2 fonts/OFL-Oxanium.txt"
for relative_path in $required_files; do test -s "$DIST_DIR/$relative_path" || { echo "Missing required build output: $relative_path" >&2; exit 1; }; done
if grep -R "__ASSET_VERSION__\|__PROJECT_\|__REPOSITORY_\|__CORE_PROJECT_\|__TOTAL_PROJECT_\|__SOFTWARE_JSON_LD__" "$DIST_DIR" --include='*.html' >/dev/null 2>&1; then echo "Unresolved build placeholder in HTML output" >&2; exit 1; fi
python3 "$ROOT_DIR/scripts/check_security_metadata.py" "$DIST_DIR/.well-known/security.txt" >/dev/null
find "$DIST_DIR" -type f -exec chmod 0644 {} +
printf 'Built %s with asset version %s\n' "$DIST_DIR" "$ASSET_VERSION"
