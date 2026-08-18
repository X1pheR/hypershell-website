import json
from pathlib import Path
import re
import unittest


ROOT = Path(__file__).parents[1]
CI = (ROOT / ".github" / "workflows" / "ci.yml").read_text(encoding="utf-8")
TEST_SCRIPT = (ROOT / "scripts" / "test.sh").read_text(encoding="utf-8")
PLAYWRIGHT_CONFIG = (ROOT / "tests" / "playwright.config.cjs").read_text(encoding="utf-8")
PACKAGE = json.loads((ROOT / "package.json").read_text(encoding="utf-8"))
LOCK = json.loads((ROOT / "package-lock.json").read_text(encoding="utf-8"))


class BrowserCiContractTests(unittest.TestCase):
    def test_github_actions_are_pinned_to_full_commit_shas(self):
        uses = re.findall(r"uses:\s*([^\s#]+)", CI)
        self.assertTrue(uses)
        for value in uses:
            self.assertRegex(value, r"^[^@]+@[0-9a-f]{40}$")

    def test_playwright_dependency_unit_is_locked_to_1_61_1(self):
        dependencies = PACKAGE["devDependencies"]
        self.assertEqual(dependencies["@playwright/test"], "1.61.1")
        self.assertEqual(dependencies["playwright-core"], "1.61.1")
        self.assertEqual(LOCK["packages"]["node_modules/playwright"]["version"], "1.61.1")
        self.assertEqual(LOCK["packages"]["node_modules/playwright-core"]["version"], "1.61.1")
        self.assertIn(
            "playwright@sha256:5b8f294aff9041b7191c34a4bab3ac270157a28774d4b0660e9743297b697e48",
            TEST_SCRIPT,
        )
        self.assertIn("npm ci --silent --no-audit --no-fund", TEST_SCRIPT)

    def test_failure_evidence_is_runner_owned_and_uploaded_only_on_failure(self):
        self.assertIn('--volume "$PLAYWRIGHT_RESULTS_DIR:/test-results"', TEST_SCRIPT)
        self.assertIn("PLAYWRIGHT_OUTPUT_DIR=/test-results", TEST_SCRIPT)
        self.assertIn("trace: 'retain-on-failure'", PLAYWRIGHT_CONFIG)
        self.assertIn("screenshot: 'only-on-failure'", PLAYWRIGHT_CONFIG)
        self.assertIn("if: failure()", CI)
        self.assertIn("retention-days: 7", CI)


if __name__ == "__main__":
    unittest.main()
