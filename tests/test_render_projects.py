import json
import tempfile
import unittest
from pathlib import Path

import sys
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))

import render_projects


class ProjectRenderingTests(unittest.TestCase):
    def test_selects_only_active_repositories_with_exact_project_homepage(self):
        repos = [
            {"name": "included", "homepage": "https://www.hypershell.eu/#projects", "archived": False, "private": False, "description": "Included", "html_url": "https://github.com/X1pheR/included"},
            {"name": "wrong-homepage", "homepage": "https://www.hypershell.eu", "archived": False, "private": False, "description": "No", "html_url": "https://github.com/X1pheR/wrong-homepage"},
            {"name": "archived", "homepage": "https://www.hypershell.eu/#projects", "archived": True, "private": False, "description": "No", "html_url": "https://github.com/X1pheR/archived"},
        ]
        selected = render_projects.select_repositories(repos)
        self.assertEqual([repo["name"] for repo in selected], ["included"])

    def test_private_repository_is_rendered_without_repository_link(self):
        html = render_projects.render_repository_card(
            {"name": "hypershell-hats", "homepage": "https://www.hypershell.eu/#projects", "archived": False, "private": True, "description": "Private tooling", "html_url": "https://github.com/X1pheR/hypershell-hats"},
            {"hypershell-hats": "HATS"},
        )
        self.assertIn("HATS", html)
        self.assertIn("PRIVATE", html)
        self.assertNotIn("https://github.com/X1pheR/hypershell-hats", html)

    def test_public_repository_uses_description_override_and_github_link(self):
        html = render_projects.render_repository_card(
            {"name": "dbackup-mcp", "homepage": "https://www.hypershell.eu/#projects", "archived": False, "private": False, "description": "Backup API", "html_url": "https://github.com/X1pheR/dbackup-mcp"},
            {"dbackup-mcp": "DBackup MCP"},
        )
        self.assertIn("DBackup MCP", html)
        self.assertIn("Backup API", html)
        self.assertIn("PUBLIC", html)
        self.assertIn('href="https://github.com/X1pheR/dbackup-mcp"', html)

    def test_repository_fields_are_html_escaped(self):
        html = render_projects.render_repository_card(
            {"name": "unsafe", "homepage": "https://www.hypershell.eu/#projects", "archived": False, "private": False, "description": '<script>alert("x")</script>', "html_url": "https://github.com/X1pheR/unsafe"},
            {},
        )
        self.assertNotIn("<script>", html)
        self.assertIn("&lt;script&gt;", html)

    def test_manual_cards_are_kept_alongside_github_cards(self):
        manual = [{"name": "HomeSight", "description": "Architecture insight", "status": "OPERATIONAL", "meta": "Architecture & inventory"}]
        html = render_projects.render_project_cards(manual, [], {})
        self.assertIn("HomeSight", html)
        self.assertIn("Architecture insight", html)

    def test_humanize_repo_name_is_default_when_no_override_exists(self):
        self.assertEqual(render_projects.display_name("pocket-id-mcp", {}), "Pocket ID MCP")
        self.assertEqual(render_projects.display_name("hypershell-infrastructure", {}), "Hypershell Infrastructure")


if __name__ == "__main__":
    unittest.main()
