import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const base = process.env.PORTFOLIO_URL || 'http://127.0.0.1:4321/';
assert.ok(['127.0.0.1', 'localhost', 'benny-ngo-portfolio.vercel.app'].includes(new URL(base).hostname));
const browser = await chromium.launch({ channel: process.platform === 'win32' ? 'msedge' : undefined });
const checks = [];
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme: 'light' });
const page = await context.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => {
  const expected404 = message.text().includes('404') && message.location().url === new URL('missing-page/', base).href;
  if (message.type() === 'error' && !expected404) errors.push(message.text());
});
const url = path => new URL(path, base).href;
const fits = async () => assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `Overflow: ${page.url()}`);
try {
  await page.goto(base);
  const robots = await context.request.get(url('robots.txt'));
  assert.ok(robots.ok());
  assert.match(await robots.text(), /^User-agent: \*\r?\nAllow: \/\r?\n/);
  for (const section of ['Work', 'About', 'Skills', 'Contact']) {
    await page.getByRole('button', { name: 'Open navigation' }).click();
    await page.getByRole('navigation', { name: 'Mobile navigation' }).getByRole('link', { name: section, exact: true }).click();
    assert.equal(new URL(page.url()).hash, `#${section.toLowerCase()}`);
    assert.equal(await page.locator('.mobile-menu').getAttribute('open'), null);
  }
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await page.getByRole('heading', { name: 'Let’s build' }).click();
  assert.equal(await page.locator('.mobile-menu').getAttribute('open'), null);
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await page.setViewportSize({ width: 1440, height: 1000 });
  assert.equal(await page.locator('.mobile-menu').getAttribute('open'), null);
  checks.push('All mobile section links, outside click and resize close the disclosure');
  await page.goto(base);
  for (let i = 0; i < 12; i++) await page.locator('.theme-toggle').click();
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'light');
  await page.evaluate(() => localStorage.setItem('portfolio-theme', '<script>invalid</script>'));
  await page.reload();
  assert.equal(await page.locator('html').getAttribute('data-theme'), 'light');
  checks.push('Rapid theme toggles and corrupt saved preference remain usable');
  await page.getByRole('link', { name: 'Live NBA Win Probability' }).click();
  for (const title of ['Common', 'UFC Win Predictor', 'Live NBA Win Probability']) {
    await page.locator('.next-project').click();
    assert.ok(await page.getByRole('heading', { level: 1, name: new RegExp(title.replace('.', '\\.')) }).isVisible());
  }
  await page.goBack();
  assert.ok(page.url().includes('ufc-win-predictor'));
  await page.goForward();
  await page.getByRole('link', { name: 'Selected work' }).click();
  assert.equal(new URL(page.url()).hash, '#work');
  checks.push('Project cycle, return link, browser back and forward work');
  await page.goto(url('projects/reddit-clone/'));
  await page.waitForURL(url('projects/common/'));
  assert.equal(await page.getByRole('link', { name: 'View source' }).getAttribute('href'), 'https://github.com/NgoBenny/common');
  assert.equal(await page.getByRole('link', { name: 'Live demo' }).getAttribute('href'), 'https://common-ngobenny.vercel.app');
  checks.push('Former project URL redirects to Common with updated repository and demo links');
  for (const path of ['', 'projects/nba-win-probability/', 'projects/common/', 'projects/ufc-win-predictor/']) {
    await page.goto(url(path));
    for (const width of [320, 360, 390, 760, 761, 768, 1024, 1440, 1920]) {
      await page.setViewportSize({ width, height: 844 });
      await fits();
    }
    for (const anchor of await page.locator('.case-toc a').all()) {
      const hash = await anchor.getAttribute('href');
      assert.ok(await page.locator(hash).count(), `Missing case section: ${hash}`);
    }
  }
  checks.push('Four routes fit nine widths, including the mobile breakpoint; case anchors exist');
  await page.goto(url('?q=%3Cscript%3Ealert(1)%3C%2Fscript%3E#unknown-section'));
  assert.equal(await page.locator('h1').count(), 1);
  assert.ok(!(await page.content()).includes('<script>alert(1)</script>'));
  checks.push('Unexpected query parameters and fragment do not inject content or break rendering');
  for (const path of ['.env', '.git/config', '.research/evidence.md', 'src/data/profile.ts', 'api/login', 'projects/not-a-project/', '%E0%A4%A']) {
    const response = await context.request.get(url(path));
    assert.ok([400, 403, 404].includes(response.status()), `Unexpected exposed path: ${path} (${response.status()})`);
  }
  checks.push('Private-file, source, absent API, unknown project and malformed-path probes are rejected');
  await page.goto(url('missing-page/'));
  await page.getByRole('link', { name: 'Back home' }).click();
  assert.equal(new URL(page.url()).pathname, '/');
  checks.push('Real unknown URL gives a usable 404 recovery link');
  assert.deepEqual(errors, [], 'Unexpected console or JavaScript errors');
  const protectedContext = await browser.newContext();
  const protectedPage = await protectedContext.newPage();
  await protectedPage.goto(base);
  assert.ok(await protectedPage.locator('meta[http-equiv="content-security-policy"]').count());
  await protectedPage.evaluate(() => {
    const script = document.createElement('script');
    script.textContent = 'window.__portfolioInjected = true;';
    document.head.append(script);
  });
  assert.equal(await protectedPage.evaluate(() => window.__portfolioInjected), undefined);
  await protectedContext.close();
  checks.push('CSP blocks an injected, unapproved inline script while normal scripts work');
  const fallback = await browser.newContext({ viewport: { width: 320, height: 700 } });
  await fallback.route('**/*.woff2', route => route.abort());
  const plain = await fallback.newPage();
  await plain.goto(base);
  assert.ok(await plain.getByRole('heading', { level: 1 }).isVisible());
  assert.ok(await plain.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  await fallback.close();
  checks.push('Blocked font uses readable system fallback without horizontal overflow');
  await mkdir('output/verification', { recursive: true });
  await writeFile('output/verification/visitor.json', JSON.stringify({ base, checks, errors }, null, 2));
  console.log(`Passed ${checks.length} visitor scenarios: ${checks.join('; ')}.`);
} finally {
  await browser.close();
}
