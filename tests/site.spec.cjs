const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

const viewports = [
  { name: 'mobile-360', width: 360, height: 800 },
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'desktop-1366', width: 1366, height: 768 },
  { name: 'desktop-1440', width: 1440, height: 1000 },
];

function observePage(page) {
  const consoleErrors = [];
  const pageErrors = [];
  const failedResponses = [];

  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('response', (response) => {
    if (response.status() >= 400) failedResponses.push({ status: response.status(), url: response.url() });
  });

  return { consoleErrors, pageErrors, failedResponses };
}

async function expectElementsWithinViewport(page, selectors) {
  const violations = await page.evaluate((requestedSelectors) => {
    return requestedSelectors.flatMap((selector) => {
      return Array.from(document.querySelectorAll(selector)).flatMap((element) => {
        const rect = element.getBoundingClientRect();
        return rect.left < -1 || rect.right > window.innerWidth + 1
          ? [{ selector, left: rect.left, right: rect.right, viewport: window.innerWidth }]
          : [];
      });
    });
  }, selectors);

  expect(violations).toEqual([]);
}

for (const viewport of viewports) {
  test(`${viewport.name}: responsive homepage contract`, async ({ browser }) => {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    const observed = observePage(page);

    const response = await page.goto('/', { waitUntil: 'networkidle' });
    expect(response?.status()).toBe(200);

    const overflow = await page.evaluate(() => ({
      viewport: window.innerWidth,
      documentWidth: document.documentElement.scrollWidth,
    }));
    expect(overflow.documentWidth).toBeLessThanOrEqual(overflow.viewport);

    await expectElementsWithinViewport(page, [
      '.hero .eyebrow',
      '.hero h1',
      '.hero-copy',
      '.hero-context',
      '.section-heading',
    ]);

    const spiny = await page.locator('.hero .spiny-image-base').evaluate((image) => ({
      naturalWidth: image.naturalWidth,
      naturalHeight: image.naturalHeight,
      renderedRatio: image.getBoundingClientRect().width / image.getBoundingClientRect().height,
    }));
    expect(spiny.naturalWidth).toBe(449);
    expect(spiny.naturalHeight).toBe(425);
    expect(spiny.renderedRatio).toBeCloseTo(449 / 425, 2);

    const missingAnchors = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a[href^="#"]'))
        .map((link) => link.getAttribute('href'))
        .filter((href) => href && href !== '#' && !document.querySelector(href));
    });
    expect(missingAnchors).toEqual([]);

    expect(await page.locator('.profile-links svg').count()).toBe(3);
    expect(await page.locator('.footer-socials svg').count()).toBe(3);

    await page.locator('.profile-card').scrollIntoViewIfNeeded();
    await expect(page.locator('.profile-card')).toHaveClass(/is-visible/);
    await page.waitForTimeout(900);

    const socialTouchTargets = await page.locator('.profile-links a, .footer-socials a').evaluateAll((links) => {
      return links.map((link) => {
        const rect = link.getBoundingClientRect();
        return { width: rect.width, height: rect.height };
      });
    });
    for (const target of socialTouchTargets) expect(target.height).toBeGreaterThanOrEqual(43.9);

    const assetUrls = await page.evaluate(() => ({
      stylesheet: document.querySelector('link[rel="stylesheet"]')?.href,
      script: document.querySelector('script[src]')?.src,
    }));
    expect(assetUrls.stylesheet).not.toContain('__ASSET_VERSION__');
    expect(assetUrls.script).not.toContain('__ASSET_VERSION__');

    if (viewport.width <= 760) {
      await expect(page.locator('.desktop-nav')).toBeHidden();
      await expect(page.locator('[data-nav-menu]')).not.toHaveAttribute('open', '');
      await expect(page.locator('.mobile-nav a').first()).toBeHidden();
    } else {
      await expect(page.locator('.desktop-nav')).toBeVisible();
      await expect(page.locator('[data-nav-menu]')).toBeHidden();
    }

    if (viewport.width >= 761) {
      const heights = await page.locator('.project-card').evaluateAll((cards) => cards.map((card) => card.getBoundingClientRect().height));
      expect(Math.max(...heights) - Math.min(...heights)).toBeLessThanOrEqual(1);
    }

    await expect(page.getByRole('heading', { name: 'DBackup MCP', level: 3 })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Open DBackup MCP on GitHub' })).toHaveAttribute('href', 'https://github.com/X1pheR/dbackup-mcp');
    await expect(page.getByRole('heading', { name: 'HATS', level: 3 })).toBeVisible();
    expect(await page.locator('a[href="https://github.com/X1pheR/hypershell-hats"]').count()).toBe(0);

    await page.locator('#inside .section-heading').evaluate((element) => {
      element.scrollIntoView({ block: 'center' });
    });
    await expect(page.locator('#inside .section-heading')).toHaveClass(/is-visible/);

    const unexpectedResponses = observed.failedResponses.filter(({ url }) => !url.endsWith('/missing-test-route'));
    expect(unexpectedResponses).toEqual([]);
    expect(observed.consoleErrors).toEqual([]);
    expect(observed.pageErrors).toEqual([]);

    await context.close();
  });
}

test('mobile navigation is keyboard-safe and restores focus', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto('/', { waitUntil: 'networkidle' });

  const menu = page.locator('[data-nav-menu]');
  const toggle = menu.locator('summary');
  const firstLink = page.locator('.mobile-nav a').first();

  await toggle.focus();
  await page.keyboard.press('Enter');
  await expect(menu).toHaveAttribute('open', '');
  await expect(firstLink).toBeVisible();

  await firstLink.focus();
  await page.keyboard.press('Escape');
  await expect(menu).not.toHaveAttribute('open', '');
  await expect(toggle).toBeFocused();
  await expect(firstLink).toBeHidden();

  await context.close();
});

test('mobile navigation remains usable without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    javaScriptEnabled: false,
  });
  const page = await context.newPage();
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const menu = page.locator('[data-nav-menu]');
  await menu.locator('summary').click();
  await expect(menu).toHaveAttribute('open', '');
  await expect(page.locator('.mobile-nav a').first()).toBeVisible();

  await context.close();
});

test('homepage glitch stops and social metadata is complete', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/', { waitUntil: 'networkidle' });

  const stage = page.locator('[data-spiny-glitch]');
  await expect(stage).toHaveClass(/is-glitching/);
  await page.waitForTimeout(3800);
  await expect(stage).not.toHaveClass(/is-glitching/);

  const metadata = await page.evaluate(() => ({
    image: document.querySelector('meta[property="og:image"]')?.content,
    width: document.querySelector('meta[property="og:image:width"]')?.content,
    height: document.querySelector('meta[property="og:image:height"]')?.content,
    alt: document.querySelector('meta[property="og:image:alt"]')?.content,
    siteName: document.querySelector('meta[property="og:site_name"]')?.content,
    locale: document.querySelector('meta[property="og:locale"]')?.content,
    structuredData: JSON.parse(document.querySelector('script[type="application/ld+json"]')?.textContent || '{}'),
  }));

  expect(metadata.image).toBe('https://www.hypershell.eu/social-card.png');
  expect(metadata.width).toBe('1200');
  expect(metadata.height).toBe('630');
  expect(metadata.alt).toBeTruthy();
  expect(metadata.siteName).toBe('Hypershell');
  expect(metadata.locale).toBe('en_US');
  expect(metadata.structuredData['@type']).toBe('WebSite');

  const socialCard = await page.evaluate(() => new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = reject;
    image.src = '/social-card.png';
  }));
  expect(socialCard).toEqual({ width: 1200, height: 630 });
});

test('custom 404 preserves dead Spiny and returns HTTP 404', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const observed = observePage(page);
  const response = await page.goto('/missing-test-route', { waitUntil: 'networkidle' });

  expect(response?.status()).toBe(404);
  const images = page.locator('.error-spiny-stage .spiny-image');
  expect(await images.count()).toBe(3);

  const dimensions = await images.first().evaluate((image) => ({
    source: image.getAttribute('src'),
    naturalWidth: image.naturalWidth,
    naturalHeight: image.naturalHeight,
    renderedRatio: image.getBoundingClientRect().width / image.getBoundingClientRect().height,
  }));
  expect(dimensions.source).toBe('/dead-spiny.png');
  expect(dimensions.naturalWidth).toBe(404);
  expect(dimensions.naturalHeight).toBe(377);
  expect(dimensions.renderedRatio).toBeCloseTo(404 / 377, 2);

  await page.waitForTimeout(3800);
  await expect(page.locator('[data-spiny-glitch]')).not.toHaveClass(/is-glitching/);

  const assetFailures = observed.failedResponses.filter(({ url }) => !url.endsWith('/missing-test-route'));
  expect(assetFailures).toEqual([]);
  expect(observed.pageErrors).toEqual([]);
});

for (const accessibilityViewport of [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'desktop', width: 1440, height: 1000 },
]) {
  test(`${accessibilityViewport.name}: WCAG A/AA audit`, async ({ browser }) => {
    const context = await browser.newContext({ viewport: accessibilityViewport });
    const page = await context.newPage();
    await page.goto('/', { waitUntil: 'networkidle' });

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    expect(results.violations).toEqual([]);
    await context.close();
  });
}
