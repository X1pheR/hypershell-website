import json
import os
import subprocess
import tempfile
import unittest
from datetime import datetime, timezone
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
import render_projects


def repo(name, **overrides):
    base = {
        "name": name,
        "homepage": "https://www.hypershell.eu/#projects",
        "archived": False,
        "private": False,
        "description": f"{name} description",
        "html_url": f"https://github.com/X1pheR/{name}",
        "pushed_at": "2026-09-01T10:00:00Z",
    }
    base.update(overrides)
    return base


class ProjectRenderingTests(unittest.TestCase):
    def test_selects_exact_homepage_or_explicit_include_and_excludes_archived(self):
        repos = [
            repo("normal"),
            repo("explicit", homepage=""),
            repo("wrong", homepage="https://www.hypershell.eu"),
            repo("archived", archived=True),
        ]
        presentation = {"explicit": {"include": True}}
        selected = render_projects.select_repositories(repos, presentation)
        self.assertEqual([item["name"] for item in selected], ["explicit", "normal"])

    def test_consolidated_presentation_controls_display_category_order_and_provenance(self):
        repos = [repo("alpha"), repo("zeta")]
        presentation = {
            "alpha": {"display_name": "Zulu", "category": "Knowledge", "provenance": "Hypershell-maintained"},
            "zeta": {"display_name": "Alpha", "category": "Infrastructure", "provenance": "Maintained fork", "order": 10},
        }
        selected = render_projects.select_repositories(repos, presentation)
        self.assertEqual([item["name"] for item in selected], ["zeta", "alpha"])
        rendered = render_projects.render_repository_card(selected[0], presentation)
        self.assertIn("Alpha", rendered)
        self.assertIn("Infrastructure", rendered)
        self.assertIn("Maintained fork", rendered)

    def test_private_repository_hides_repository_url_but_keeps_public_detail_route(self):
        item = repo("private-tool", private=True)
        rendered = render_projects.render_repository_card(item, {"private-tool": {"display_name": "Private Tool"}})
        self.assertIn("PRIVATE", rendered)
        self.assertIn('href="/projects/private-tool/"', rendered)
        self.assertNotIn(item["html_url"], rendered)

    def test_public_repository_has_deep_link_and_explicit_github_action(self):
        item = repo("dbackup-mcp", description="Backup API")
        rendered = render_projects.render_repository_card(item, {"dbackup-mcp": {"display_name": "DBackup MCP", "category": "Operations"}})
        self.assertIn('id="dbackup-mcp"', rendered)
        self.assertIn('href="/projects/dbackup-mcp/"', rendered)
        self.assertIn('href="https://github.com/X1pheR/dbackup-mcp"', rendered)
        self.assertIn("View on GitHub", rendered)

    def test_raw_github_topics_are_not_published(self):
        item = repo("tool", topics=["secret-topic"])
        rendered = render_projects.render_repository_card(item, {"tool": {"category": "Infrastructure"}})
        self.assertIn('data-project-category="infrastructure"', rendered)
        self.assertNotIn("secret-topic", rendered)

    def test_filter_buttons_use_curated_categories(self):
        repos = [repo("a"), repo("b"), repo("c")]
        presentation = {"a": {"category": "Infrastructure"}, "b": {"category": "Operations"}, "c": {"category": "Infrastructure"}}
        rendered = render_projects.render_filter_buttons(repos, presentation)
        self.assertIn("All <span>3</span>", rendered)
        self.assertIn("Infrastructure <span>2</span>", rendered)
        self.assertIn("Operations <span>1</span>", rendered)

    def test_recent_activity_prefers_releases_excludes_private_and_excluded_repo(self):
        repos = [
            repo("release-project", pushed_at="2026-09-01T10:00:00Z"),
            repo("push-project", pushed_at="2026-09-05T10:00:00Z"),
            repo("hypershell-website", pushed_at="2026-09-08T10:00:00Z"),
            repo("private-project", private=True, pushed_at="2026-09-09T10:00:00Z"),
        ]
        releases = {"release-project": {"tag_name": "v2.0.0", "published_at": "2026-09-07T10:00:00Z", "html_url": "https://github.com/X1pheR/release-project/releases/tag/v2.0.0"}}
        presentation = {"hypershell-website": {"exclude_from_activity": True}}
        rendered = render_projects.render_recent_activity(repos, releases, presentation)
        self.assertIn("Latest release", rendered)
        self.assertIn("v2.0.0", rendered)
        self.assertIn("Push Project", rendered)
        self.assertNotIn("Hypershell Website", rendered)
        self.assertNotIn("Private Project", rendered)
        self.assertLess(rendered.index("Release Project"), rendered.index("Push Project"))

    def test_software_json_ld_contains_public_repositories_only_and_valid_ampersands(self):
        repos = [repo("public", description="Tools & skills"), repo("private", private=True)]
        raw = render_projects.render_software_json_ld(repos, {"public": {"category": "Identity & resilience"}})
        data = json.loads(raw)
        self.assertEqual(len(data["itemListElement"]), 1)
        item = data["itemListElement"][0]["item"]
        self.assertEqual(item["description"], "Tools & skills")
        self.assertEqual(item["applicationCategory"], "Identity & resilience")
        self.assertEqual(item["url"], "https://www.hypershell.eu/projects/public/")

    def test_repository_fields_are_html_escaped(self):
        item = repo("unsafe", description='<script>alert("x")</script>')
        rendered = render_projects.render_repository_card(item, {})
        self.assertNotIn("<script>", rendered)
        self.assertIn("&lt;script&gt;", rendered)

    def test_manual_card_has_stable_deep_link(self):
        rendered = render_projects.render_manual_card({"name": "HomeSight", "description": "Architecture insight", "status": "Operational", "meta": "Architecture & inventory"})
        self.assertIn('id="homesight"', rendered)
        self.assertIn('href="/projects/homesight/"', rendered)

    def test_selected_repository_requires_description(self):
        with self.assertRaisesRegex(ValueError, "missing a GitHub description"):
            render_projects.select_repositories([repo("missing", description="  ")], {})

    def test_project_detail_pages_and_sitemap_are_generated(self):
        manual = [{"name": "HomeSight", "description": "Architecture insight", "status": "Operational", "meta": "Architecture & inventory"}]
        repositories = [repo("dbackup-mcp")]
        presentation = {"dbackup-mcp": {"display_name": "DBackup MCP", "category": "Operations", "provenance": "Hypershell-maintained"}}
        releases = {"dbackup-mcp": {"tag_name": "v1.0.0", "published_at": "2026-09-06T10:00:00Z", "html_url": "https://github.com/X1pheR/dbackup-mcp/releases/tag/v1.0.0"}}
        with tempfile.TemporaryDirectory() as directory:
            pages = render_projects.write_detail_pages(directory, (ROOT / "src/project.html").read_text(), manual, repositories, releases, presentation)
            render_projects.render_sitemap(Path(directory) / "sitemap.xml", pages, repositories)
            self.assertTrue((Path(directory) / "projects/homesight/index.html").is_file())
            detail = (Path(directory) / "projects/dbackup-mcp/index.html").read_text()
            self.assertIn("DBackup MCP", detail)
            self.assertIn("v1.0.0", detail)
            sitemap = (Path(directory) / "sitemap.xml").read_text()
            self.assertIn("https://www.hypershell.eu/projects/homesight/", sitemap)
            self.assertIn("<lastmod>2026-09-01</lastmod>", sitemap)

    def test_presentation_config_replaces_old_parallel_files(self):
        data_dir = ROOT / "src/data"
        presentation = json.loads((data_dir / "project-presentation.json").read_text())
        self.assertEqual(presentation["hypershell-reach"]["order"], 10)
        self.assertTrue(presentation["technitium-mcp"]["include"])
        for old in ["project-categories.json", "project-includes.json", "project-order.json", "project-display-names.json"]:
            self.assertFalse((data_dir / old).exists())

    def test_sitemap_is_generated_not_hand_authored_in_public_assets(self):
        self.assertFalse((ROOT / "public/sitemap.xml").exists())

    def test_brand_derivative_provenance_points_to_accepted_sources(self):
        provenance = json.loads((ROOT / "src/data/brand-assets.json").read_text())
        self.assertEqual(provenance["masterbrand"]["sha256"], "ef3c0d8226849f2a4749fbf5f6f9fbd7c146db01ce94383041d04ea1ae536d33")
        self.assertEqual(provenance["spiny"]["sha256"], "3436c7f849ecc678b44bc547fe72a64c00f76bab64ad34170d63273fbec16688")
        self.assertTrue((ROOT / "public/spiny.webp").is_file())
        self.assertTrue((ROOT / "public/masterbrand-96.png").is_file())

    def test_security_txt_has_more_than_ninety_days_remaining(self):
        completed = subprocess.run([sys.executable, str(ROOT / "scripts/check_security_metadata.py"), str(ROOT / "public/.well-known/security.txt")], capture_output=True, text=True)
        self.assertEqual(completed.returncode, 0, completed.stderr)

    def test_resolve_token_reads_protected_token_file_when_env_is_absent(self):
        with tempfile.TemporaryDirectory() as directory:
            token_file = Path(directory) / "github-token"
            token_file.write_text("example-token\n", encoding="utf-8")
            self.assertEqual(render_projects.resolve_token({}, token_file), "example-token")


class DeploymentScriptTests(unittest.TestCase):
    def test_deploy_does_not_preserve_metadata_on_target_directory(self):
        deploy = (ROOT / "scripts/deploy.sh").read_text()
        self.assertNotIn('cp -a "$DIST_DIR/." "$TARGET_DIR/"', deploy)
        self.assertIn('find "$DIST_DIR" -mindepth 1 -maxdepth 1 -exec cp -a -- {} "$TARGET_DIR/" \\;', deploy)

    def test_deploy_preserves_runtime_tmp_and_removes_other_stale_files(self):
        with tempfile.TemporaryDirectory() as directory:
            target = Path(directory) / "site"
            export_dir = target / "tmp/ticket"; export_dir.mkdir(parents=True)
            exported = export_dir / "artifact.bin"; exported.write_bytes(b"bridge-export")
            stale = target / "stale.txt"; stale.write_text("stale", encoding="utf-8")
            env = dict(os.environ)
            env["TARGET_DIR"] = str(target)
            env["GITHUB_REPOSITORIES_FILE"] = str(ROOT / "tests/github-repositories.fixture.json")
            env["GITHUB_RELEASES_FILE"] = str(ROOT / "tests/github-releases.fixture.json")
            subprocess.run([str(ROOT / "scripts/deploy.sh")], check=True, env=env)
            self.assertEqual(exported.read_bytes(), b"bridge-export")
            self.assertFalse(stale.exists())
            self.assertTrue((target / "projects/hypershell-reach/index.html").is_file())
            self.assertGreater((target / "sitemap.xml").read_text().count("<url>"), 1)


if __name__ == "__main__":
    unittest.main()
