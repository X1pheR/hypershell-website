#!/usr/bin/env python3
import argparse
import html
import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path

PROJECT_HOMEPAGE = "https://www.hypershell.eu/#projects"
API_URL = "https://api.github.com/user/repos?affiliation=owner&per_page=100&sort=full_name"
ACRONYMS = {"api", "bws", "hats", "id", "mcp", "oidc", "qmd", "ui"}


def display_name(repo_name, overrides):
    if repo_name in overrides:
        return overrides[repo_name]
    words = []
    for part in repo_name.split("-"):
        words.append(part.upper() if part.lower() in ACRONYMS else part.capitalize())
    return " ".join(words)


def select_repositories(repositories, overrides):
    selected = [
        repo
        for repo in repositories
        if not repo.get("archived") and repo.get("homepage") == PROJECT_HOMEPAGE
    ]
    for repo in selected:
        if not str(repo.get("description") or "").strip():
            raise ValueError(f"Selected GitHub repository '{repo.get('name', '<unknown>')}' is missing a GitHub description")
    return sorted(
        selected,
        key=lambda repo: display_name(repo.get("name", ""), overrides).casefold(),
    )


def status_class(status):
    normalized = status.strip().lower().replace("_", "-").replace(" ", "-")
    if normalized in {"operational", "public"}:
        return "operational"
    if normalized in {"in-progress", "private"}:
        return "in-progress"
    return "exploratory"


def render_manual_card(project):
    name = html.escape(project["name"])
    description = html.escape(project["description"])
    status = html.escape(project.get("status", "PROJECT"))
    meta = html.escape(project.get("meta", "Hypershell project"))
    classes = "glass-card project-card"
    if project.get("featured"):
        classes += " project-featured"
    logo = ""
    if project.get("logo"):
        logo = f'\n          <img class="project-logo" src="{html.escape(project["logo"], quote=True)}" alt="" width="64" height="64" aria-hidden="true">'
    return f'''        <article class="{classes}">
          <div class="project-meta"><span class="status {status_class(status)}">{status}</span><span>{meta}</span></div>
          <h3>{name}</h3>
          <p>{description}</p>{logo}
        </article>'''


def render_repository_card(repo, overrides):
    name = html.escape(display_name(repo["name"], overrides))
    description = html.escape(repo["description"].strip())
    private = bool(repo.get("private"))
    visibility = "PRIVATE" if private else "PUBLIC"
    link = ""
    if not private and repo.get("html_url"):
        url = html.escape(repo["html_url"], quote=True)
        link = f'''\n          <a class="project-repo-link" href="{url}" aria-label="Open {name} on GitHub">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3.3-.4 6.7-1.6 6.7-7.3A5.7 5.7 0 0 0 19.2 3a5.3 5.3 0 0 0-.1-2.8S17.9-.2 15 1.7a13.4 13.4 0 0 0-7 0C5.1-.2 3.9.2 3.9.2A5.3 5.3 0 0 0 3.8 3a5.7 5.7 0 0 0-1.5 4.2c0 5.6 3.4 6.9 6.7 7.3A4.8 4.8 0 0 0 8 18v4"/><path d="M8 19c-3 .9-3-1.5-4-2"/></svg>
            <span class="sr-only">GitHub</span>
          </a>'''
    return f'''        <article class="glass-card project-card">
          <div class="project-meta"><span class="status {status_class(visibility)}">{visibility}</span><span>GitHub project</span></div>
          <h3>{name}</h3>
          <p>{description}</p>{link}
        </article>'''


def render_project_cards(manual_projects, repositories, overrides):
    cards = [render_manual_card(project) for project in manual_projects]
    cards.extend(render_repository_card(repo, overrides) for repo in select_repositories(repositories, overrides))
    return "\n\n".join(cards)


def load_json(path):
    with open(path, encoding="utf-8") as handle:
        return json.load(handle)


def resolve_token(environ, token_file=None):
    token = environ.get("GH_TOKEN") or environ.get("GITHUB_TOKEN")
    if token:
        return token.strip()
    if token_file:
        token = Path(token_file).read_text(encoding="utf-8").strip()
        if token:
            return token
    raise RuntimeError("GH_TOKEN, GITHUB_TOKEN, or a readable GitHub token file is required to fetch private and public GitHub project metadata")


def fetch_repositories(token_file=None):
    token = resolve_token(os.environ, token_file)
    request = urllib.request.Request(
        API_URL,
        headers={
            "Accept": "application/vnd.github+json",
            "Authorization": f"Bearer {token}",
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "hypershell-website-build",
        },
    )
    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            return json.load(response)
    except (urllib.error.URLError, json.JSONDecodeError) as exc:
        raise RuntimeError(f"Unable to fetch GitHub repository metadata: {exc}") from exc


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--template", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--manual", required=True)
    parser.add_argument("--overrides", required=True)
    parser.add_argument("--repositories-file")
    parser.add_argument("--token-file")
    args = parser.parse_args()

    repositories = load_json(args.repositories_file) if args.repositories_file else fetch_repositories(args.token_file)
    manual_projects = load_json(args.manual)
    overrides = load_json(args.overrides)
    project_html = render_project_cards(manual_projects, repositories, overrides)

    template = Path(args.template).read_text(encoding="utf-8")
    marker = "__PROJECT_CARDS__"
    if template.count(marker) != 1:
        raise RuntimeError(f"Expected exactly one {marker} marker in {args.template}")
    Path(args.output).write_text(template.replace(marker, project_html), encoding="utf-8")


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"Project rendering failed: {exc}", file=sys.stderr)
        sys.exit(1)
