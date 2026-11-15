import { expect, test, type Page } from '@playwright/test';

const errors = (page: Page) => {
  const list: string[] = [];
  page.on('pageerror', (e) => list.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') list.push(m.text()); });
  return list;
};

test('every view renders without errors', async ({ page }) => {
  const errs = errors(page);
  for (const id of ['strecke', 'gegengleis', 'bauhilfe', 'signale', 'regeln', 'quellen']) {
    await page.goto(`./#${id}`);
    await expect(page.locator('h1')).toBeVisible();
  }
  expect(errs).toEqual([]);
});

test('line plan reacts to settings and runs the train', async ({ page }) => {
  const errs = errors(page);
  await page.goto('./#strecke');
  await page.getByRole('button', { name: 'Ks', exact: true }).click();
  await page.getByRole('button', { name: 'in Block 2' }).click();
  await page.getByRole('button', { name: 'Blockstrecke' }).click();
  await page.locator('.plan [data-k="bk1"]').first().click();
  await expect(page.locator('.info h3')).toHaveText('Blocksignal Bk 1');
  await expect(page.locator('.info dd').first()).toContainText('Hp 0');
  await page.getByRole('button', { name: /Zug fahren lassen/ }).click();
  await expect(page.locator('.speed')).not.toHaveText('0 km/h', { timeout: 3000 });
  expect(errs).toEqual([]);
});

test('language switch translates the interface', async ({ page }) => {
  await page.goto('./#strecke');
  await page.getByRole('button', { name: 'Switch to English' }).click();
  await expect(page.locator('h1')).toHaveText('Where each signal stands');
  await page.goto('./#signale');
  await expect(page.locator('h1')).toHaveText('Signal aspects');
  await page.reload();
  await expect(page.locator('h1')).toHaveText('Signal aspects');
});

test('building guide tabs and saved parts', async ({ page }) => {
  const errs = errors(page);
  await page.goto('./#bauhilfe');
  for (const tab of ['Bau-Rezepte', 'Weichen & Anschlüsse', 'Geschwindigkeiten', 'Meine Bauteile', 'Abstandsrechner']) {
    await page.getByRole('button', { name: tab }).click();
  }
  await page.getByRole('button', { name: 'Meine Bauteile' }).click();
  await page.getByLabel('Vorsignal', { exact: true }).uncheck();
  await page.getByRole('button', { name: 'Bau-Rezepte' }).click();
  await expect(page.locator('.steps li.miss').first()).toBeVisible();
  await page.getByRole('button', { name: 'Geschwindigkeiten' }).click();
  const radius = page.getByLabel('Bogenradius (m)');
  await radius.fill('2000');
  await radius.press('Enter');
  await expect(page.locator('.tile .tv').nth(1)).toHaveText(/1[0-9]0 km\/h/);
  expect(errs).toEqual([]);
});

test('light mode is remembered', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Zum hellen Design wechseln' }).click();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-mode', 'light');
});
