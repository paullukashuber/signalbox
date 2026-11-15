import { expect, test, type Page } from '@playwright/test';

const errors = (page: Page) => {
  const list: string[] = [];
  page.on('pageerror', (e) => list.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') list.push(m.text()); });
  return list;
};

const openPlanner = async (page: Page) => {
  await page.goto('./#bauhilfe');
  await page.getByRole('button', { name: 'Mein Streckenplan' }).click();
};

const setKm = async (page: Page, scope: string, label: string, km: string) => {
  const f = page.getByRole('group', { name: scope, exact: true }).getByLabel(label);
  await f.fill(km);
  await f.press('Enter');
};

/** Removes the example plan and builds: station Nord, curve, level crossing, station Süd. */
const buildLine = async (page: Page) => {
  const del = page.locator('.pl-del');
  while (await del.count()) await del.first().click();
  const add = (name: string) => page.getByRole('group', { name: 'Element hinzufügen' }).getByRole('button', { name: `+ ${name}` }).click();
  await add('Bahnhof');
  await page.locator('.pl-el').last().getByLabel('Name').fill('Nord');
  await add('Bogen');
  await add('Bahnübergang');
  await add('Bahnhof');
  await page.locator('.pl-el').last().getByLabel('Name').fill('Süd');
  await setKm(page, 'Bahnhof Süd', 'km Ende (Ausfahrweiche, Mitte)', '8,8');
  await setKm(page, 'Bahnhof Süd', 'km Anfang (erste Einfahrweiche)', '8,0');
};

test('planner builds a list for two stations, a curve and a crossing and keeps it after reload', async ({ page }) => {
  const errs = errors(page);
  await openPlanner(page);
  await buildLine(page);

  const list = page.locator('.pl-list');
  for (const name of ['Einfahrsignal Nord', 'Ausfahrsignal Nord', 'Blocksignal Bk 1 (hinter Ausfahrsignal Nord)', 'Lf 6 Geschwindigkeitsankündigung', 'Lf 7 Bogenanfang', 'Rautentafel Bü 2', 'Überwachungssignal Bü 0/Bü 1', 'Einfahrsignal Süd']) {
    await expect(list.getByText(name, { exact: true }).first()).toBeVisible();
  }
  // home signal Nord: first switch at km 1.000 minus 200 m overlap
  const esNord = list.locator('tr', { has: page.getByText('Einfahrsignal Nord', { exact: true }) }).first();
  await expect(esNord).toContainText('0,800');
  await expect(esNord).toContainText('Richtwert');
  await expect(page.locator('svg.pl-band text').first()).toBeVisible();

  await esNord.getByRole('checkbox').check();
  await expect(page.locator('.pl-listhead')).toContainText(/1 von \d+ gebaut/);

  await page.reload();
  await page.getByRole('button', { name: 'Mein Streckenplan' }).click();
  await expect(page.locator('.pl-el').first().getByLabel('Name')).toHaveValue('Nord');
  await expect(page.locator('.pl-el').last().getByLabel('Name')).toHaveValue('Süd');
  await expect(page.locator('.pl-el')).toHaveCount(4);
  await expect(page.locator('.pl-list tr', { has: page.getByText('Einfahrsignal Nord', { exact: true }) }).first().getByRole('checkbox')).toBeChecked();
  expect(errs).toEqual([]);
});

test('planner warns about short blocks and missing Lf boards', async ({ page }) => {
  await openPlanner(page);
  await buildLine(page);
  await setKm(page, 'Bahnhof Süd', 'km Anfang (erste Einfahrweiche)', '2,5');
  await expect(page.locator('.pl-warn [data-code="block-short"]')).toBeVisible();
  await page.getByRole('button', { name: 'Meine Bauteile' }).click();
  await page.getByLabel('Lf 6 / Lf 7').uncheck();
  await page.getByRole('button', { name: 'Mein Streckenplan' }).click();
  await expect(page.locator('.pl-warn [data-code="curve-no-lf"]')).toBeVisible();
});

test('planner exports, imports and prints', async ({ page }) => {
  const errs = errors(page);
  await openPlanner(page);
  await buildLine(page);
  await page.getByLabel('Name des Plans').fill('Testlinie');

  const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Als JSON exportieren' }).click()]);
  expect(download.suggestedFilename()).toBe('streckenplan-testlinie.json');
  const file = await download.path();

  const del = page.locator('.pl-del');
  while (await del.count()) await del.first().click();
  await expect(page.locator('.pl-el')).toHaveCount(0);

  await page.locator('[data-testid="plan-import"]').setInputFiles(file);
  await expect(page.locator('.pl-el')).toHaveCount(4);
  await expect(page.getByRole('status').filter({ hasText: 'Testlinie' })).toBeVisible();

  await page.locator('[data-testid="plan-import"]').setInputFiles({ name: 'bad.json', mimeType: 'application/json', buffer: Buffer.from('{"nope":1}') });
  await expect(page.getByText('Die Datei ist kein gültiger Streckenplan.')).toBeVisible();
  await expect(page.locator('.pl-el')).toHaveCount(4);

  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('.pl-edit')).toBeHidden();
  await expect(page.locator('header.top')).toBeHidden();
  await expect(page.locator('.pl-print h2')).toHaveText('Testlinie');
  await expect(page.locator('.pl-list')).toBeVisible();
  expect(errs).toEqual([]);
});
