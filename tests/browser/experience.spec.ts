import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';

test('birthday journey validates the date and updates the personal record without external requests', async ({ page }) => {
  const external: string[] = [];
  const errors: string[] = [];
  page.on('request', (request) => { if (!request.url().startsWith('http://127.0.0.1:5173')) external.push(request.url()); });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Your life.');
  await page.getByLabel('Day of birth', { exact: true }).fill('29');
  await page.getByLabel('Month of birth', { exact: true }).selectOption('2');
  await page.getByLabel('Year of birth', { exact: true }).fill('2001');
  await page.getByRole('button', { name: 'Find my Barça' }).click();
  await expect(page.getByRole('alert')).toContainText('real calendar date');
  await page.getByLabel('Year of birth', { exact: true }).fill('2000');
  await page.getByRole('button', { name: 'Find my Barça' }).click();
  await expect(page.locator('.data-context')).toContainText('29 February 2000');
  await expect(page.locator('.metric-3 .metric-value')).toContainText('24');
  await expect(page.getByRole('alert')).toHaveCount(0);
  expect(errors).toEqual([]);
  expect(external).toEqual([]);
});

test('responsive layouts and accessibility', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  for (const width of [320, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.screenshot({ path: `artifacts/desktop-${width}.png`, fullPage: true });
    const layout = await page.evaluate(() => ({
      width: window.innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      overflowing: [...document.querySelectorAll('body *')].map((element) => ({ element: element.tagName, class: element.className, left: element.getBoundingClientRect().left, right: element.getBoundingClientRect().right })).filter((element) => element.right > window.innerWidth + 1 || element.left < -1),
    }));
    expect(layout.documentWidth, `no horizontal overflow at ${width}px: ${JSON.stringify(layout.overflowing)}`).toBeLessThanOrEqual(width);
    if (width === 1440) {
      for (const [name, selector] of Object.entries({ hero: '.hero', personal: '.personal-section', trophies: '.cabinet-section', memories: '.memories-section', calendar: '.date-section', card: '.share-section' })) {
        await page.locator(selector).screenshot({ path: `artifacts/section-${name}.png` });
      }
    }
  }
  const accessibility = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(accessibility.violations).toEqual([]);
});

test('the match mosaic filters real results, supports keyboard navigation, and restores focus after a dialog', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Filter by season', { exact: true }).selectOption('2010/11');
  await page.getByRole('button', { name: 'Wins', exact: true }).click();
  await expect(page.locator('.mosaic-meta')).toContainText('30 MATCHES');
  await expect(page.locator('.match-square')).toHaveCount(30);
  await page.locator('.match-mosaic').focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('.selected-score')).toContainText('Atlético Madrid');
  await page.getByRole('button', { name: 'Inside the match' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('dialog')).toContainText('10 years');
  await expect(page.getByRole('button', { name: 'Close dialog' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Inside the match' })).toBeFocused();
});

test('personal chapters, trophy seasons, memories, and calendar dates respond correctly', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Louis van Gaal', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Ferran Torres', exact: true })).toBeVisible();
  await expect(page.locator('.peer-note')).toContainText('92 days');
  await page.locator('.trophy-europe summary').click();
  await expect(page.locator('.trophy-europe li')).toHaveCount(4);
  await expect(page.locator('.trophy-europe')).toContainText('2008/09');
  await page.getByRole('button', { name: 'Relive Koundé. Extra time.', exact: true }).click();
  await expect(page.getByRole('dialog')).toContainText('116th minute');
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'More memories', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Previous memories', exact: true })).toBeEnabled();
  await page.getByLabel('Archive month', { exact: true }).selectOption('1');
  await page.getByLabel('Archive day', { exact: true }).selectOption('31');
  await page.getByLabel('Archive month', { exact: true }).selectOption('2');
  await expect(page.locator('.calendar-record-heading')).toContainText('29 February');
  await expect(page.getByLabel('Archive day', { exact: true })).toHaveValue('29');
});

test('out-of-archive birthdays show honest empty states with a way to explore the history', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Day of birth', { exact: true }).fill('1');
  await page.getByLabel('Month of birth', { exact: true }).selectOption('1');
  await page.getByLabel('Year of birth', { exact: true }).fill('2026');
  await page.getByRole('button', { name: 'Find my Barça' }).click();
  await expect(page.locator('.metric-0 .metric-value')).toHaveText('0');
  await expect(page.locator('.mosaic-empty')).toContainText('after our May 2025 snapshot');
  await expect(page.locator('.memories-empty')).toContainText('The best nights are still ahead');
  await page.getByRole('button', { name: 'All iconic nights', exact: true }).click();
  await expect(page.locator('.memory-card')).toHaveCount(9);
  await expect(page.locator('.memories-empty')).toHaveCount(0);
});

test('the personal image downloads successfully and the methodology dialog is accessible', async ({ page }) => {
  await page.goto('/');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download example card', exact: true }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('cule-1999-11-29.png');
  await download.saveAs('artifacts/cule-example.png');
  const png = await readFile('artifacts/cule-example.png');
  expect(png.byteLength).toBeGreaterThan(30_000);
  expect(png.readUInt32BE(16)).toBe(1080);
  expect(png.readUInt32BE(20)).toBe(1350);
  await expect(page.locator('.share-status')).toContainText('Your card is ready');
  await page.getByRole('button', { name: 'Behind the data', exact: false }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  const accessibility = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(accessibility.violations).toEqual([]);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Behind the data', exact: false })).toBeFocused();
});
