import assert from 'node:assert/strict';
import { mkdir, readFile, readdir } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const base = process.env.PORTFOLIO_URL || 'http://127.0.0.1:4321';
const origin = new URL(base);
assert.ok(['127.0.0.1', 'localhost'].includes(origin.hostname), 'Smoke checks only target the local portfolio.');
const routes = ['projects/nba-win-probability/', 'projects/common/', 'projects/ufc-win-predictor/'];
const output = 'output/verification';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || (process.platform === 'win32' ? 'msedge' : undefined) });
const errors = [];
const failures = [];
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, colorScheme: 'light' });
const page = await context.newPage();
page.on('pageerror', error => errors.push(error.message));
page.on('response', response => { if (response.url().startsWith(base) && response.status() >= 400 && !response.url().includes('404.html')) failures.push(response.url()); });
const href = path => new URL(path, `${base.replace(/\/$/, '')}/`).href;
async function noOverflow(target) {
  assert.ok(await target.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `Horizontal overflow at ${await target.url()}`);
}
async function audit(target, label) {
  const result = await new AxeBuilder({ page: target }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  assert.deepEqual(result.violations.map(v => ({ id: v.id, nodes: v.nodes.length })), [], `Accessibility: ${label}`);
}
async function screenshot(target, filename) {
  // Full-page captures do not automatically load below-the-fold lazy images.
  for (const img of await target.locator('img').all()) {
    await img.scrollIntoViewIfNeeded();
    await img.evaluate(image => image.decode());
  }
  await target.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await target.screenshot({ path: `${output}/${filename}`, fullPage: true });
}
try {
  await page.goto(base);
  await page.evaluate(() => document.fonts.ready);
  await page.getByRole('heading', { level: 1 }).waitFor();
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'light');
  assert.equal(await page.locator('.project-card').count(), 3);
  assert.equal(await page.locator('form').count(), 0);
  await noOverflow(page);
  await audit(page, 'desktop light');
  await screenshot(page, 'desktop-light.png');
  await page.screenshot({ path: `${output}/desktop-preview.png` });
  await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(() => document.activeElement?.textContent?.trim()), 'Skip to content');
  await page.getByRole('button', { name: 'Switch to dark theme' }).click();
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
  await page.reload();
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
  await audit(page, 'desktop dark');
  await screenshot(page, 'desktop-dark.png');
  await page.getByRole('button', { name: 'Switch to light theme' }).click();

  const links = await page.locator('a').evaluateAll(nodes => nodes.map(n => n.getAttribute('href')).filter(Boolean));
  for (const link of new Set(links)) {
    if (/^(mailto:|https?:)/.test(link)) continue;
    const url = new URL(link, page.url());
    if (url.pathname === origin.pathname && url.hash) {
      assert.ok(await page.locator(url.hash).count(), `Missing section ${url.hash}`);
    } else {
      assert.ok((await context.request.get(url.href)).ok(), `Broken internal link ${url.href}`);
    }
  }
  for (const route of routes) {
    await page.goto(href(route));
    await page.getByRole('heading', { level: 1 }).waitFor();
    await noOverflow(page);
    await audit(page, route);
    if (!route.includes('common')) {
      assert.ok(await page.getByText('Source private', { exact: true }).count());
      assert.equal(await page.getByRole('link', { name: 'View source' }).count(), 0);
    }
    for (const width of [360, 390, 768]) {
      await page.setViewportSize({ width, height: 844 });
      await noOverflow(page);
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    await screenshot(page, `${route.split('/')[1]}.png`);
  }
  await page.goto(href('404.html'));
  await page.getByRole('link', { name: 'Back home' }).click();
  assert.equal(new URL(page.url()).pathname, origin.pathname);
  const pdf = await context.request.get(href('resume.pdf'));
  assert.ok(pdf.ok());
  assert.equal((await pdf.body()).subarray(0, 5).toString(), '%PDF-');
  for (const width of [360, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 844 });
    await noOverflow(page);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Open navigation' }).click();
  assert.equal(await page.locator('.mobile-menu').getAttribute('open'), '');
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('.mobile-menu').getAttribute('open'), null);
  assert.ok(await page.locator('.mobile-menu summary').evaluate(node => node === document.activeElement));
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await page.getByRole('navigation', { name: 'Mobile navigation' }).getByRole('link', { name: 'Work', exact: true }).click();
  assert.equal(await page.locator('.mobile-menu').getAttribute('open'), null);
  await page.goto(base);
  await audit(page, 'mobile light');
  await screenshot(page, 'mobile-light.png');
  await page.screenshot({ path: `${output}/mobile-preview.png` });
  await page.getByRole('button', { name: 'Switch to dark theme' }).click();
  await audit(page, 'mobile dark');
  await screenshot(page, 'mobile-dark.png');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior), 'auto');
  assert.equal(await page.locator('.hero-main').evaluate(el => getComputedStyle(el).animationName), 'none');
  // 720 CSS px is the effective width of a 1440px viewport at 200% zoom.
  await page.setViewportSize({ width: 720, height: 500 });
  await noOverflow(page);

  const blocked = await browser.newContext({ colorScheme: 'dark', viewport: { width: 390, height: 844 } });
  await blocked.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Storage blocked', 'SecurityError'); } });
  });
  const blockedPage = await blocked.newPage();
  await blockedPage.goto(base);
  assert.equal(await blockedPage.locator('html').getAttribute('data-theme'), 'dark');
  await blockedPage.getByRole('button', { name: 'Switch to light theme' }).click();
  assert.equal(await blockedPage.locator('html').getAttribute('data-theme'), 'light');
  await blocked.close();
  const system = await browser.newContext({ colorScheme: 'light' });
  const systemPage = await system.newPage();
  await systemPage.goto(base);
  await systemPage.emulateMedia({ colorScheme: 'dark' });
  await systemPage.waitForFunction(() => document.documentElement.dataset.theme === 'dark');
  await system.close();
  const noJS = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 }, colorScheme: 'light' });
  const plain = await noJS.newPage();
  await plain.goto(base);
  assert.equal(await plain.locator('.project-card').count(), 3);
  await plain.getByRole('button', { name: 'Open navigation' }).click();
  assert.ok(await plain.getByRole('navigation', { name: 'Mobile navigation' }).isVisible());
  await noOverflow(plain);
  await noJS.close();
  assert.deepEqual(errors, [], 'Browser JavaScript errors');
  assert.deepEqual(failures, [], 'Failed local asset requests');
  // Scan generated text, not research or model source, for accidental private paths/links.
  const inlineScripts = new Set();
  async function scan(directory) {
    let scriptBytes = 0;
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = `${directory}/${entry.name}`;
      if (entry.isDirectory()) { scriptBytes += await scan(path); continue; }
      if (/\.(html|js|css|xml|txt)$/.test(path)) {
        const bytes = await readFile(path);
        const text = bytes.toString();
        assert.ok(!/C:\\Users\\|C:\/Users\/|api[_-]?key\s*[:=]|github\.com\/NgoBenny\/(nba-win-probability-model|ufc-win-predictor)/i.test(text), `Private material in ${path}`);
        if (path.endsWith('.js')) scriptBytes += gzipSync(bytes).length;
        if (path.endsWith('.html')) {
          for (const match of text.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
            if (!/\bsrc\s*=/.test(match[1]) && match[2].trim()) inlineScripts.add(match[2]);
          }
        }
      }
    }
    return scriptBytes;
  }
  const scriptBytes = await scan('dist') + [...inlineScripts].reduce((bytes, script) => bytes + gzipSync(script).length, 0);
  assert.ok(scriptBytes < 30000, `Compressed first-party JS budget: ${scriptBytes}`);
  console.log(`Passed: routes, themes, storage failure, mobile navigation, reduced motion, no-JS, responsive layout, axe accessibility and generated-content scan. JS: ${scriptBytes} gzip bytes. Screenshots: ${output}/`);
} finally {
  await browser.close();
}
