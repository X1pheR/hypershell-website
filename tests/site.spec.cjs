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
      '.hero-context',
      '.hero-signature',
      '.hero-scope',
      '.section-heading',
    ]);

    const spiny = await page.locator('[data-hero-spiny-glitch] > picture:not([data-islayer]) > .spiny-image-base').evaluate((image) => ({
      naturalWidth: image.naturalWidth,
      naturalHeight: image.naturalHeight,
      renderedRatio: image.getBoundingClientRect().width / image.getBoundingClientRect().height,
      currentSrc: image.currentSrc,
    }));
    expect(spiny.naturalWidth).toBe(512);
    expect(spiny.naturalHeight).toBe(512);
    expect(spiny.renderedRatio).toBeCloseTo(1, 2);
    expect(spiny.currentSrc).toContain('/spiny.webp');
    await expect(page.locator('.brand img')).toHaveAttribute('src', '/masterbrand-96.png');
    await expect(page.locator('.dashboard-link')).toBeVisible();

    const missingAnchors = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a[href^="#"]'))
        .map((link) => link.getAttribute('href'))
        .filter((href) => href && href !== '#' && !document.querySelector(href));
    });
    expect(missingAnchors).toEqual([]);

    const navOrders = await page.locator('.primary-nav').evaluateAll((navs) => navs.map((nav) => Array.from(nav.querySelectorAll('a')).map((link) => link.getAttribute('href'))));
    for (const order of navOrders) expect(order).toEqual(['#inside', '#architecture', '#projects', '#about']);

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
      scripts: Array.from(document.querySelectorAll('script[src]')).map((script) => script.src),
    }));
    expect(assetUrls.stylesheet).not.toContain('__ASSET_VERSION__');
    expect(assetUrls.scripts).toEqual(expect.arrayContaining([
      expect.stringContaining('/vendor/powerglitch-2.5.0.min.js'),
      expect.stringContaining('/site.js'),
    ]));
    for (const script of assetUrls.scripts) expect(script).not.toContain('__ASSET_VERSION__');

    if (viewport.width <= 760) {
      await expect(page.locator('.desktop-nav')).toBeHidden();
      await expect(page.locator('[data-nav-menu]')).not.toHaveAttribute('open', '');
      await expect(page.locator('.mobile-nav a').first()).toBeHidden();
    } else {
      await expect(page.locator('.desktop-nav')).toBeVisible();
      await expect(page.locator('[data-nav-menu]')).toBeHidden();
    }

    if (viewport.width >= 761) {
      const heightRanges = await page.locator('.project-grid').evaluateAll((grids) => grids.map((grid) => {
        const heights = Array.from(grid.querySelectorAll('.project-card')).map((card) => card.getBoundingClientRect().height);
        return heights.length > 1 ? Math.max(...heights) - Math.min(...heights) : 0;
      }));
      for (const range of heightRanges) expect(range).toBeLessThanOrEqual(1);
    }

    await expect(page.getByText('One environment, not a pile of services.', { exact: true })).toBeVisible();
    const sectionOrder = await page.locator('main > section[id]').evaluateAll((sections) => sections.map((section) => section.id));
    expect(sectionOrder).toEqual(['top', 'inside', 'why', 'architecture', 'projects', 'about']);

    await expect(page.getByText('Core initiatives', { exact: true })).toBeVisible();
    await expect(page.getByText('Maintained software', { exact: true })).toBeVisible();
    const coreGroup = page.locator('.project-group', { has: page.getByText('Core initiatives', { exact: true }) });
    const maintainedGroup = page.locator('.project-group', { has: page.getByText('Maintained software', { exact: true }) });
    const coreCount = await coreGroup.locator('.project-card').count();
    const repositoryCount = await maintainedGroup.locator('.repository-card').count();
    await expect(coreGroup.locator('.project-group-count')).toContainText(String(coreCount));
    await expect(maintainedGroup.locator('.project-group-count')).toContainText(String(repositoryCount));
    await expect(page.locator('.project-total strong')).toHaveText(String(coreCount + repositoryCount));
    await expect(page.locator('.hero-scope a').nth(0).locator('strong')).toHaveText('6');
    await expect(page.locator('.hero-scope a').nth(1).locator('strong')).toHaveText(String(coreCount));
    await expect(page.locator('.hero-scope a').nth(2).locator('strong')).toHaveText(String(repositoryCount));
    await expect(maintainedGroup.locator('.project-category')).toHaveCount(repositoryCount);
    await expect(maintainedGroup.locator('.project-provenance')).toHaveCount(repositoryCount);
    await expect(page.locator('#core-initiatives')).toHaveCount(1);
    await expect(maintainedGroup.locator('[data-project-filters]')).toBeVisible();
    await expect(page.getByText('GitHub project', { exact: true })).toHaveCount(0);

    await expect(page.getByRole('heading', { name: 'DBackup MCP', level: 4 })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Open DBackup MCP on GitHub' })).toHaveAttribute('href', 'https://github.com/X1pheR/dbackup-mcp');
    const privateCards = maintainedGroup.locator('.repository-card:has(.visibility-private)');
    expect(await privateCards.count()).toBeGreaterThan(0);
    const privateCard = privateCards.first();
    await expect(privateCard.getByText('PRIVATE', { exact: true })).toBeVisible();
    await expect(privateCard.locator('.visibility-badge')).toHaveClass(/visibility-private/);
    await expect(privateCard.locator('.status')).toHaveCount(0);
    await expect(privateCard.locator('.project-repo-link')).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Hypershell Reach', level: 4 })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Open Hypershell Reach on GitHub' })).toHaveAttribute('href', 'https://github.com/X1pheR/hypershell-reach');
    await expect(maintainedGroup.getByText('Latest public updates.', { exact: true })).toBeVisible();
    await expect(maintainedGroup.locator('.activity-item')).toHaveCount(3);
    await expect(maintainedGroup.getByText('Latest release', { exact: true }).first()).toBeVisible();
    await expect(maintainedGroup.locator('.project-activity').getByText('Hypershell Website', { exact: true })).toHaveCount(0);

    await page.locator('#inside .section-heading').scrollIntoViewIfNeeded();
    await expect(page.locator('#inside .section-heading')).toHaveClass(/is-visible/);

    const unexpectedResponses = observed.failedResponses.filter(({ url }) => !url.endsWith('/missing-test-route'));
    expect(unexpectedResponses).toEqual([]);
    expect(observed.consoleErrors).toEqual([]);
    expect(observed.pageErrors).toEqual([]);

    await context.close();
  });
}

test('maintained software filters are keyboard-accessible and preserve the total count', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  const page = await context.newPage();
  await page.goto('/', { waitUntil: 'networkidle' });

  const group = page.locator('#maintained-software');
  const total = await group.locator('.repository-card').count();
  const operations = group.getByRole('button', { name: /Operations/ });
  const operationsCount = await group.locator('.repository-card[data-project-category="operations"]').count();
  expect(operationsCount).toBeGreaterThan(0);
  await operations.focus();
  await page.keyboard.press('Enter');
  await expect(operations).toHaveAttribute('aria-pressed', 'true');
  await expect(group.locator('.repository-card:visible')).toHaveCount(operationsCount);
  await expect(group.locator('[data-project-filter-status]')).toHaveText(`Showing ${operationsCount} of ${total} projects`);

  const all = group.getByRole('button', { name: /^All/ });
  await all.click();
  await expect(group.locator('.repository-card:visible')).toHaveCount(total);
  await expect(group.locator('.project-group-count')).toContainText(String(total));
  const touchHeights = await group.locator('.project-filter, .project-repo-link').evaluateAll((items) => items.filter((item) => !item.hidden && getComputedStyle(item).display !== 'none').map((item) => item.getBoundingClientRect().height));
  for (const height of touchHeights) expect(height).toBeGreaterThanOrEqual(43.9);
  const publicCard = group.locator('.repository-card', { has: page.getByRole('link', { name: 'Open DBackup MCP on GitHub' }) });
  const placement = await publicCard.evaluate((card) => { const link = card.querySelector('.project-repo-link'); const c = card.getBoundingClientRect(); const l = link.getBoundingClientRect(); return { rightGap: c.right - l.right, leftGap: l.left - c.left }; });
  expect(placement.rightGap).toBeLessThan(40);
  expect(placement.leftGap).toBeGreaterThan(placement.rightGap);
  await context.close();
});

test('public metadata uses Hypershell identity and publishes a security contact', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await expect(page.locator('link[rel="icon"][href="/favicon-96x96.png"]')).toHaveCount(1);
  await expect(page.locator('link[rel="icon"][href="/favicon.svg"]')).toHaveCount(0);

  const manifestResponse = await page.request.get('/site.webmanifest');
  expect(manifestResponse.status()).toBe(200);
  const manifest = await manifestResponse.json();
  expect(manifest.name).toBe('Hypershell');
  expect(manifest.short_name).toBe('Hypershell');
  expect(manifest.theme_color).toBe('#050816');
  expect(manifest.background_color).toBe('#050816');
  expect(manifest.icons.every((icon) => icon.purpose === 'any')).toBe(true);
  const structuredData = await page.locator('script[type="application/ld+json"]').evaluateAll((scripts) => scripts.map((script) => JSON.parse(script.textContent)));
  const software = structuredData.find((entry) => entry['@type'] === 'ItemList');
  expect(software).toBeTruthy();
  expect(software.itemListElement.length).toBeGreaterThan(0);
  expect(software.itemListElement.every((entry) => entry.item['@type'] === 'SoftwareSourceCode')).toBe(true);

  const securityResponse = await page.request.get('/.well-known/security.txt');
  expect(securityResponse.status()).toBe(200);
  const security = await securityResponse.text();
  expect(security).toContain('Contact: mailto:info@hypershell.eu');
  expect(security).toContain('Canonical: https://www.hypershell.eu/.well-known/security.txt');
});

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

test('homepage hero glitches intermittently and keeps header static', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/', { waitUntil: 'networkidle' });

  const spinyStack = page.locator('[data-hero-spiny-glitch]');
  const titleStack = page.locator('[data-hero-title-glitch]');
  await expect(spinyStack).toHaveAttribute('data-glitched', '1');
  await expect(titleStack).toHaveAttribute('data-glitched', '1');
  expect(await spinyStack.locator('[data-islayer]').count()).toBeGreaterThan(0);
  expect(await titleStack.locator('[data-islayer]').count()).toBeGreaterThan(0);
  expect(await page.locator('.site-header [data-islayer]').count()).toBe(0);

  const cloneAccessibility = await page.locator('[data-hero-spiny-glitch] [data-islayer], [data-hero-title-glitch] [data-islayer]').evaluateAll(
    (layers) => layers.map((layer) => layer.getAttribute('aria-hidden')),
  );
  expect(cloneAccessibility.every((value) => value === 'true')).toBe(true);

  await page.evaluate(() => document.fonts.ready);
  const wordmarkFont = await page.locator('#hero-title').evaluate((element) => ({
    family: getComputedStyle(element).fontFamily,
    weight: getComputedStyle(element).fontWeight,
    loaded: document.fonts.check('700 32px Oxanium'),
  }));
  expect(wordmarkFont.family).toContain('Oxanium');
  expect(wordmarkFont.weight).toBe('700');
  expect(wordmarkFont.loaded).toBe(true);

  await page.evaluate(() => {
    window.__heroGlitchActivations = 0;
    window.__heroGlitchTargets = [];
    window.__heroGlitchObserver = new MutationObserver(() => {
      const active = document.documentElement.dataset.heroGlitchActive;
      if (active) {
        window.__heroGlitchActivations += 1;
        window.__heroGlitchTargets.push(active);
      }
    });
    window.__heroGlitchObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-hero-glitch-active'],
    });
  });
  await page.waitForFunction(() => window.__heroGlitchActivations > 0, null, { timeout: 4500 });
  const recurringTargets = await page.evaluate(() => window.__heroGlitchTargets);
  expect(recurringTargets.some((target) => ['spiny', 'title'].includes(target))).toBe(true);

  const visualStyles = await page.evaluate(() => {
    const dashboard = document.querySelector('.dashboard-link');
    const social = document.querySelector('.footer-socials a');
    const dashboardSvg = dashboard?.querySelector('svg');
    const socialSvg = social?.querySelector('svg');
    const pick = (element) => {
      const style = getComputedStyle(element);
      return {
        color: style.color,
        borderRadius: style.borderRadius,
        backgroundImage: style.backgroundImage,
        boxShadow: style.boxShadow,
        transform: style.transform,
      };
    };
    return {
      dashboard: pick(dashboard),
      social: pick(social),
      dashboardFilter: getComputedStyle(dashboardSvg).filter,
      socialFilter: getComputedStyle(socialSvg).filter,
    };
  });
  expect(visualStyles.dashboard.color).toBe(visualStyles.social.color);
  expect(visualStyles.dashboard.borderRadius).toBe(visualStyles.social.borderRadius);
  expect(visualStyles.dashboard.backgroundImage).toBe(visualStyles.social.backgroundImage);
  expect(visualStyles.dashboard.boxShadow).toBe(visualStyles.social.boxShadow);
  expect(visualStyles.dashboardFilter).toBe(visualStyles.socialFilter);
  expect(visualStyles.dashboard.transform).toBe('none');

  const dashboard = page.locator('.dashboard-link');
  await dashboard.hover();
  expect(await dashboard.evaluate((element) => getComputedStyle(element).transform)).toBe('none');

  const metadata = await page.evaluate(() => ({
    image: document.querySelector('meta[property="og:image"]')?.content,
    width: document.querySelector('meta[property="og:image:width"]')?.content,
    height: document.querySelector('meta[property="og:image:height"]')?.content,
    alt: document.querySelector('meta[property="og:image:alt"]')?.content,
    twitterAlt: document.querySelector('meta[name="twitter:image:alt"]')?.content,
    siteName: document.querySelector('meta[property="og:site_name"]')?.content,
    locale: document.querySelector('meta[property="og:locale"]')?.content,
    structuredData: JSON.parse(document.querySelector('script[type="application/ld+json"]')?.textContent || '{}'),
  }));

  expect(metadata.image).toBe('https://www.hypershell.eu/social-card.jpg');
  expect(metadata.width).toBe('1200');
  expect(metadata.height).toBe('630');
  expect(metadata.alt).toBeTruthy();
  expect(metadata.twitterAlt).toBeTruthy();
  expect(metadata.siteName).toBe('Hypershell');
  expect(metadata.locale).toBe('en_US');
  expect(metadata.structuredData['@type']).toBe('WebSite');

  const socialCard = await page.evaluate(() => new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = reject;
    image.src = '/social-card.jpg';
  }));
  expect(socialCard).toEqual({ width: 1200, height: 630 });
});

test('mobile keeps glass blur and uses sticky maintained-software filters', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto('/', { waitUntil: 'networkidle' });
  await expect(page.locator('.dashboard-link')).toBeVisible();
  const blur = await page.locator('.glass-card').first().evaluate((element) => getComputedStyle(element).backdropFilter || getComputedStyle(element).webkitBackdropFilter);
  expect(blur).toContain('blur');
  const filters = page.locator('#maintained-software [data-project-filters]');
  await filters.scrollIntoViewIfNeeded();
  const styles = await filters.evaluate((element) => { const style = getComputedStyle(element); return { position: style.position, top: style.top, blur: style.backdropFilter || style.webkitBackdropFilter }; });
  expect(styles.position).toBe('sticky');
  expect(styles.blur).toContain('blur');
  await context.close();
});

test('generated project detail route is shareable, responsive and keeps public/private boundaries', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const response = await page.goto('/projects/hypershell-reach/', { waitUntil: 'networkidle' });
  expect(response?.status()).toBe(200);
  await expect(page.getByRole('heading', { name: 'Hypershell Reach', level: 1 })).toBeVisible();
  await expect(page.getByRole('link', { name: /View on GitHub/ })).toHaveAttribute('href', 'https://github.com/X1pheR/hypershell-reach');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://www.hypershell.eu/projects/hypershell-reach/');
  await expect(page.locator('.brand img')).toHaveAttribute('src', '/masterbrand-96.png');
  await expect(page.locator('.dashboard-link')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(axe.violations).toEqual([]);
  await context.close();
});

test('reduced motion disables recurring hero glitches', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  await page.goto('/', { waitUntil: 'networkidle' });
  await expect(page.locator('[data-hero-spiny-glitch]')).not.toHaveAttribute('data-glitched', '1');
  await expect(page.locator('[data-hero-title-glitch]')).not.toHaveAttribute('data-glitched', '1');
  expect(await page.locator('.hero [data-islayer]').count()).toBe(0);
  expect(await page.evaluate(() => document.documentElement.dataset.heroGlitchActive || '')).toBe('');
  await context.close();
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
  expect(dimensions.source).toBe('/spiny-dead.png');
  expect(dimensions.naturalWidth).toBe(512);
  expect(dimensions.naturalHeight).toBe(512);
  expect(dimensions.renderedRatio).toBeCloseTo(1, 2);
  expect(await page.locator('.error-spiny-stage').evaluate((element) => getComputedStyle(element).animationName)).toBe('none');

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
