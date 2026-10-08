#!/usr/bin/env python3
import argparse, base64, html, json, os, re, sys, urllib.error, urllib.request
from collections import Counter
from datetime import datetime
from pathlib import Path
from urllib.parse import quote

API_URL = "https://api.github.com/user/repos?affiliation=owner&per_page=100&sort=full_name"
CATEGORY_ORDER = ["Agentic AI", "Infrastructure", "Applications", "Knowledge", "Operations", "Identity & Resilience"]
CATEGORIES = set(CATEGORY_ORDER)
KINDS = {"application", "mcp-server", "service", "tool", "library", "website"}
KIND_LABELS = {
    "application": "Application",
    "mcp-server": "MCP server",
    "service": "Service",
    "tool": "Tool",
    "library": "Library",
    "website": "Website",
}
BASE_URL = "https://www.hypershell.eu"


def load_json(path):
    with open(path, encoding="utf-8") as handle:
        return json.load(handle)


def slugify(value):
    return re.sub(r"[^a-z0-9]+", "-", value.casefold()).strip("-") or "project"


def presentation_for(name, presentation):
    return presentation.get(name, {})


def validate_product_metadata(repo_name, payload):
    if not isinstance(payload, dict):
        raise ValueError(f"{repo_name}: hypershell.json must contain a JSON object")
    required = {"schema_version", "name", "category", "kind"}
    allowed = required | {"upstream"}
    missing = required - set(payload)
    extra = set(payload) - allowed
    if missing:
        raise ValueError(f"{repo_name}: hypershell.json is missing {', '.join(sorted(missing))}")
    if extra:
        raise ValueError(f"{repo_name}: hypershell.json contains unsupported fields: {', '.join(sorted(extra))}")
    if payload["schema_version"] != 1:
        raise ValueError(f"{repo_name}: unsupported hypershell.json schema_version")
    if not isinstance(payload["name"], str) or not payload["name"].strip():
        raise ValueError(f"{repo_name}: hypershell.json name must be non-empty")
    if payload["category"] not in CATEGORIES:
        raise ValueError(f"{repo_name}: hypershell.json category is not canonical")
    if payload["kind"] not in KINDS:
        raise ValueError(f"{repo_name}: hypershell.json kind is not canonical")
    upstream = payload.get("upstream")
    if upstream is not None:
        if not isinstance(upstream, dict) or set(upstream) != {"repository", "reason"}:
            raise ValueError(f"{repo_name}: upstream must contain exactly repository and reason")
        repository = upstream["repository"]
        reason = upstream["reason"]
        if not isinstance(repository, str) or not re.fullmatch(r"[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+", repository):
            raise ValueError(f"{repo_name}: upstream.repository must use owner/repository")
        if not isinstance(reason, str) or not reason.strip():
            raise ValueError(f"{repo_name}: upstream.reason must be non-empty")
    return payload


def metadata_for(repo_name, metadata):
    item = metadata.get(repo_name)
    if item is None:
        raise ValueError(f"{repo_name}: selected repository has no hypershell.json metadata")
    return item


def display_name(repo_name, metadata):
    return metadata_for(repo_name, metadata)["name"]


def category_name(repo_name, metadata):
    return metadata_for(repo_name, metadata)["category"]


def kind_name(repo_name, metadata):
    return metadata_for(repo_name, metadata)["kind"]


def kind_label(repo_name, metadata):
    return KIND_LABELS[kind_name(repo_name, metadata)]


def category_slug(value):
    return slugify(value)


def provenance_name(repo_name, metadata):
    return "Maintained downstream" if metadata_for(repo_name, metadata).get("upstream") else "Hypershell-maintained"


def select_repositories(repositories, metadata, presentation):
    selected = []
    for repo in repositories:
        if repo.get("archived"):
            continue
        name = repo.get("name", "")
        if name not in metadata:
            continue
        validate_product_metadata(name, metadata[name])
        if not str(repo.get("description") or "").strip():
            raise ValueError(f"Selected GitHub repository '{name or '<unknown>'}' is missing a GitHub description")
        selected.append(repo)
    return sorted(
        selected,
        key=lambda repo: (
            int(presentation_for(repo["name"], presentation).get("order", 1000)),
            display_name(repo["name"], metadata).casefold(),
        ),
    )


def status_class(status):
    normalized = status.strip().lower().replace("_", "-").replace(" ", "-")
    return normalized if normalized in {"operational", "in-progress"} else "exploratory"


def manual_slug(project):
    return project.get("slug") or slugify(project["name"])


def repo_slug(repo):
    return repo["name"]


def render_manual_card(project):
    name = html.escape(project["name"])
    desc = html.escape(project["description"])
    status = html.escape(project.get("status", "PROJECT"))
    meta = html.escape(project.get("meta", "Hypershell project"))
    slug = html.escape(manual_slug(project), quote=True)
    classes = "glass-card project-card" + (" project-featured" if project.get("featured") else "")
    logo = ""
    if project.get("logo"):
        logo = f'\n          <img class="project-logo" src="{html.escape(project["logo"], quote=True)}" alt="" width="64" height="64" loading="lazy" aria-hidden="true">'
    return f'''        <article class="{classes}" id="{slug}">
          <div class="project-meta"><span class="status {status_class(status)}">{status}</span><span>{meta}</span></div>
          <h4><a class="project-detail-link" href="/projects/{slug}/">{name}</a></h4>
          <p>{desc}</p>{logo}
        </article>'''


def render_repository_card(repo, metadata):
    display = display_name(repo["name"], metadata)
    name = html.escape(display)
    desc = html.escape(repo["description"].strip())
    private = bool(repo.get("private"))
    vis = "PRIVATE" if private else "PUBLIC"
    vis_name = "private" if private else "public"
    category = category_name(repo["name"], metadata)
    provenance = provenance_name(repo["name"], metadata)
    kind = kind_name(repo["name"], metadata)
    slug = html.escape(repo_slug(repo), quote=True)
    link = ""
    if not private and repo.get("html_url"):
        url = html.escape(repo["html_url"], quote=True)
        link = f'\n          <a class="project-repo-link" href="{url}" aria-label="Open {name} on GitHub"><span>View on GitHub</span><span aria-hidden="true">↗</span></a>'
    return f'''        <article class="glass-card project-card repository-card" id="{slug}" data-project-category="{html.escape(category_slug(category), quote=True)}" data-project-kind="{html.escape(kind, quote=True)}">
          <div class="project-meta"><span class="visibility-badge visibility-{vis_name}" aria-label="Repository visibility: {vis_name}">{vis}</span><span class="project-category">{html.escape(category)}</span><span class="project-provenance">{html.escape(provenance)}</span></div>
          <h4><a class="project-detail-link" href="/projects/{slug}/">{name}</a></h4>
          <p>{desc}</p>{link}
        </article>'''


def render_filter_buttons(repositories, metadata):
    counts = Counter(category_name(repo["name"], metadata) for repo in repositories)
    mcp_count = sum(kind_name(repo["name"], metadata) == "mcp-server" for repo in repositories)
    buttons = [f'<button class="project-filter is-active" type="button" data-project-filter="all" aria-pressed="true">All <span>{len(repositories)}</span></button>']
    if mcp_count:
        buttons.append(f'<button class="project-filter" type="button" data-project-filter="kind:mcp-server" aria-pressed="false">MCP Servers <span>{mcp_count}</span></button>')
    for label in CATEGORY_ORDER:
        if counts.get(label):
            buttons.append(f'<button class="project-filter" type="button" data-project-filter="{html.escape(category_slug(label), quote=True)}" aria-pressed="false">{html.escape(label)} <span>{counts[label]}</span></button>')
    return "\n              ".join(buttons)


def parse_date(value):
    if not value:
        return None
    try:
        return datetime.fromisoformat(value.replace("Z", "+00:00"))
    except (TypeError, ValueError):
        return None


def resolve_token(environ, token_file=None):
    token = environ.get("GH_TOKEN") or environ.get("GITHUB_TOKEN")
    if token:
        return token.strip()
    if token_file:
        token = Path(token_file).read_text(encoding="utf-8").strip()
        if token:
            return token
    raise RuntimeError("GH_TOKEN, GITHUB_TOKEN, or a readable GitHub token file is required to fetch private and public GitHub project metadata")


def github_json(url, token, allow_404=False):
    req = urllib.request.Request(url, headers={
        "Accept": "application/vnd.github+json",
        "Authorization": f"Bearer {token}",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "hypershell-website-build",
    })
    try:
        with urllib.request.urlopen(req, timeout=20) as response:
            return json.load(response)
    except urllib.error.HTTPError as exc:
        if allow_404 and exc.code == 404:
            return None
        raise


def fetch_repositories(token):
    return github_json(API_URL, token)


def fetch_repository_metadata(repositories, token):
    metadata = {}
    for repo in repositories:
        if repo.get("archived"):
            continue
        name = repo.get("name", "")
        item = github_json(
            f'https://api.github.com/repos/X1pheR/{quote(name)}/contents/hypershell.json',
            token,
            allow_404=True,
        )
        if not item:
            continue
        if item.get("type") != "file" or item.get("encoding") != "base64" or not isinstance(item.get("content"), str):
            raise ValueError(f"{name}: hypershell.json could not be read as a repository file")
        try:
            payload = json.loads(base64.b64decode(item["content"]).decode("utf-8"))
        except (ValueError, UnicodeError) as exc:
            raise ValueError(f"{name}: hypershell.json is invalid JSON") from exc
        metadata[name] = validate_product_metadata(name, payload)
    return metadata


def fetch_latest_releases(repositories, token):
    releases = {}
    for repo in repositories:
        if repo.get("private"):
            continue
        item = github_json(
            f'https://api.github.com/repos/X1pheR/{quote(repo["name"])}/releases/latest',
            token,
            allow_404=True,
        )
        if item:
            releases[repo["name"]] = item
    return releases


def activity_for(repo, releases, metadata, presentation):
    if repo.get("private") or not repo.get("html_url") or presentation_for(repo["name"], presentation).get("exclude_from_activity"):
        return None
    release = releases.get(repo["name"])
    if release:
        stamp = parse_date(release.get("published_at") or release.get("created_at"))
        if stamp:
            return {"timestamp": stamp, "repo": repo, "kind": "release", "label": release.get("tag_name") or "Release", "url": release.get("html_url") or repo["html_url"]}
    stamp = parse_date(repo.get("pushed_at") or repo.get("updated_at"))
    return {"timestamp": stamp, "repo": repo, "kind": "push", "label": "Recently updated", "url": repo["html_url"]} if stamp else None


def render_recent_activity(repositories, releases, metadata, presentation):
    candidates = [a for a in (activity_for(repo, releases, metadata, presentation) for repo in repositories) if a]
    candidates.sort(key=lambda a: a["timestamp"], reverse=True)
    items = []
    for activity in candidates[:3]:
        repo = activity["repo"]
        name = html.escape(display_name(repo["name"], metadata))
        url = html.escape(activity["url"], quote=True)
        ts = activity["timestamp"]
        kicker = "Latest release" if activity["kind"] == "release" else "Recently updated"
        detail = html.escape(activity["label"])
        items.append(f'''          <a class="activity-item" href="{url}" aria-label="Open recent activity for {name} on GitHub">
            <span class="activity-kicker">{kicker}</span><strong>{name}</strong><span class="activity-release">{detail}</span>
            <span class="activity-meta"><time datetime="{ts.date().isoformat()}">{ts.day} {ts.strftime('%b %Y')}</time><span aria-hidden="true">GitHub ↗</span></span>
          </a>''')
    return "\n".join(items) if items else '          <p class="activity-empty">Recent public update data is unavailable for this build.</p>'


def render_software_json_ld(repositories, metadata):
    items = []
    for position, repo in enumerate((r for r in repositories if not r.get("private") and r.get("html_url")), 1):
        items.append({
            "@type": "ListItem",
            "position": position,
            "item": {
                "@type": "SoftwareSourceCode",
                "name": display_name(repo["name"], metadata),
                "description": repo["description"].strip(),
                "url": f"{BASE_URL}/projects/{repo_slug(repo)}/",
                "codeRepository": repo["html_url"],
                "applicationCategory": category_name(repo["name"], metadata),
            },
        })
    return json.dumps({"@context": "https://schema.org", "@type": "ItemList", "name": "Hypershell maintained software", "itemListElement": items}, separators=(",", ":")).replace("</", "<\\/")


def detail_meta_repo(repo, metadata):
    private = bool(repo.get("private"))
    vis = "PRIVATE" if private else "PUBLIC"
    vis_name = "private" if private else "public"
    return f'<span class="visibility-badge visibility-{vis_name}">{vis}</span><span class="project-category">{html.escape(category_name(repo["name"], metadata))}</span><span class="project-provenance">{html.escape(provenance_name(repo["name"], metadata))}</span>'


def fact(label, value):
    return f'<div><dt>{html.escape(label)}</dt><dd>{value}</dd></div>'


def render_detail_page(template, title, description, slug, meta, action, facts):
    canonical = f"{BASE_URL}/projects/{slug}/"
    values = {
        "__PROJECT_TITLE__": html.escape(title),
        "__PROJECT_META_DESCRIPTION__": html.escape(description, quote=True),
        "__PROJECT_CANONICAL__": canonical,
        "__PROJECT_META__": meta,
        "__PROJECT_DESCRIPTION__": html.escape(description),
        "__PROJECT_PRIMARY_ACTION__": action,
        "__PROJECT_FACTS__": facts,
    }
    out = template
    for marker, value in values.items():
        out = out.replace(marker, value)
    return out


def write_detail_pages(output_dir, project_template, manual_projects, repositories, releases, metadata):
    projects_root = Path(output_dir) / "projects"
    projects_root.mkdir(parents=True, exist_ok=True)
    pages = []
    for project in manual_projects:
        slug = manual_slug(project)
        title = project["name"]
        desc = project["description"]
        meta = f'<span class="status {status_class(project.get("status", "Project"))}">{html.escape(project.get("status", "Project"))}</span><span>{html.escape(project.get("meta", "Core initiative"))}</span>'
        facts = fact("Project type", "Core initiative") + fact("Lifecycle", html.escape(project.get("status", "Project"))) + fact("Scope", html.escape(project.get("meta", "Hypershell")))
        page = render_detail_page(project_template, title, desc, slug, meta, "", facts)
        dest = projects_root / slug
        dest.mkdir(exist_ok=True)
        (dest / "index.html").write_text(page, encoding="utf-8")
        pages.append((slug, None))
    for repo in repositories:
        slug = repo_slug(repo)
        title = display_name(repo["name"], metadata)
        desc = repo["description"].strip()
        meta = detail_meta_repo(repo, metadata)
        action = ""
        if not repo.get("private") and repo.get("html_url"):
            action = f'<a class="home-link project-primary-link" href="{html.escape(repo["html_url"], quote=True)}">View on GitHub <span aria-hidden="true">↗</span></a>'
        facts = (
            fact("Category", html.escape(category_name(repo["name"], metadata)))
            + fact("Type", html.escape(kind_label(repo["name"], metadata)))
            + fact("Provenance", html.escape(provenance_name(repo["name"], metadata)))
            + fact("Visibility", "Private repository" if repo.get("private") else "Public repository")
        )
        upstream = metadata_for(repo["name"], metadata).get("upstream")
        if upstream:
            upstream_id = upstream["repository"]
            facts += fact("Upstream", f'<a href="https://github.com/{html.escape(upstream_id, quote=True)}">{html.escape(upstream_id)}</a>')
        release = releases.get(repo["name"])
        if not repo.get("private") and release and parse_date(release.get("published_at") or release.get("created_at")):
            facts += fact("Latest release", html.escape(release.get("tag_name") or "Release")) + fact("Released", parse_date(release.get("published_at") or release.get("created_at")).date().isoformat())
        elif not repo.get("private") and parse_date(repo.get("pushed_at") or repo.get("updated_at")):
            facts += fact("Latest public update", parse_date(repo.get("pushed_at") or repo.get("updated_at")).date().isoformat())
        page = render_detail_page(project_template, title, desc, slug, meta, action, facts)
        dest = projects_root / slug
        dest.mkdir(exist_ok=True)
        (dest / "index.html").write_text(page, encoding="utf-8")
        pages.append((slug, parse_date(repo.get("pushed_at") or repo.get("updated_at"))))
    return pages


def render_sitemap(path, pages, repositories):
    dates = [parse_date(repo.get("pushed_at") or repo.get("updated_at")) for repo in repositories]
    dates = [d for d in dates if d]
    root_date = max(dates).date().isoformat() if dates else None
    lines = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">', '  <url>', f'    <loc>{BASE_URL}/</loc>']
    if root_date:
        lines.append(f'    <lastmod>{root_date}</lastmod>')
    lines += ['    <changefreq>monthly</changefreq>', '    <priority>1.0</priority>', '  </url>']
    for slug, stamp in pages:
        lines += ['  <url>', f'    <loc>{BASE_URL}/projects/{html.escape(slug)}/</loc>']
        if stamp:
            lines.append(f'    <lastmod>{stamp.date().isoformat()}</lastmod>')
        lines += ['    <changefreq>monthly</changefreq>', '    <priority>0.7</priority>', '  </url>']
    lines.append('</urlset>')
    Path(path).write_text("\n".join(lines) + "\n", encoding="utf-8")


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--template", required=True)
    p.add_argument("--project-template", required=True)
    p.add_argument("--output", required=True)
    p.add_argument("--output-dir", required=True)
    p.add_argument("--manual", required=True)
    p.add_argument("--presentation", required=True)
    p.add_argument("--repositories-file")
    p.add_argument("--metadata-file")
    p.add_argument("--releases-file")
    p.add_argument("--token-file")
    args = p.parse_args()

    token = None
    if args.repositories_file:
        repositories = load_json(args.repositories_file)
    else:
        token = resolve_token(os.environ, args.token_file)
        repositories = fetch_repositories(token)

    if args.metadata_file:
        raw_metadata = load_json(args.metadata_file)
        metadata = {name: validate_product_metadata(name, payload) for name, payload in raw_metadata.items()}
    else:
        if token is None:
            token = resolve_token(os.environ, args.token_file)
        metadata = fetch_repository_metadata(repositories, token)

    manual = load_json(args.manual)
    presentation = load_json(args.presentation)
    selected = select_repositories(repositories, metadata, presentation)

    if args.releases_file:
        releases = load_json(args.releases_file)
    elif token:
        releases = fetch_latest_releases(selected, token)
    else:
        releases = {}

    template = Path(args.template).read_text(encoding="utf-8")
    domain_count = template.count('class="glass-card domain-card"')
    if domain_count < 1:
        raise RuntimeError("Unable to derive the public domain count from the homepage template")

    replacements = {
        "__CORE_PROJECT_CARDS__": "\n\n".join(render_manual_card(p) for p in manual),
        "__REPOSITORY_PROJECT_CARDS__": "\n\n".join(render_repository_card(r, metadata) for r in selected),
        "__REPOSITORY_FILTERS__": render_filter_buttons(selected, metadata),
        "__RECENT_ACTIVITY_ITEMS__": render_recent_activity(selected, releases, metadata, presentation),
        "__SOFTWARE_JSON_LD__": render_software_json_ld(selected, metadata),
        "__DOMAIN_COUNT__": str(domain_count),
        "__CORE_PROJECT_COUNT__": str(len(manual)),
        "__REPOSITORY_PROJECT_COUNT__": str(len(selected)),
        "__TOTAL_PROJECT_COUNT__": str(len(manual) + len(selected)),
    }
    for marker, value in replacements.items():
        if template.count(marker) < 1:
            raise RuntimeError(f"Expected at least one {marker} marker in {args.template}")
        template = template.replace(marker, value)
    Path(args.output).write_text(template, encoding="utf-8")

    project_template = Path(args.project_template).read_text(encoding="utf-8")
    pages = write_detail_pages(args.output_dir, project_template, manual, selected, releases, metadata)
    render_sitemap(Path(args.output_dir) / "sitemap.xml", pages, selected)


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(f"Project rendering failed: {exc}", file=sys.stderr)
        sys.exit(1)
