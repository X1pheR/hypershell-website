const { defineConfig } = require('@playwright/test');

const baseURL = process.env.BASE_URL || 'http://127.0.0.1:4173';
const config = {
  testDir: __dirname,
  testMatch: 'site.spec.cjs',
  fullyParallel: false,
  workers: 1,
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  reporter: 'line',
  use: {
    baseURL,
    browserName: 'chromium',
    trace: 'retain-on-failure',
  },
};

if (!process.env.BASE_URL) {
  config.webServer = {
    command: 'node server.cjs',
    port: 4173,
    reuseExistingServer: false,
    timeout: 10_000,
    env: {
      SITE_ROOT: process.env.SITE_ROOT,
    },
  };
}

module.exports = defineConfig(config);
