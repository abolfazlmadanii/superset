/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const require = createRequire(
  join(root, '../../superset-frontend/package.json'),
);
const { chromium } = require('playwright');
const outDir = join(root, 'screenshots');
mkdirSync(outDir, { recursive: true });

const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:8088';
const password = process.env.SUPERSET_ADMIN_PASSWORD || 'admin';

const browser = await chromium.launch({
  channel: 'chrome',
  headless: true,
});
const page = await browser.newPage({
  viewport: { width: 1440, height: 920 },
  baseURL,
});

await page.goto('/login/');
await page.locator('[data-test="username-input"]').fill('admin');
await page.locator('[data-test="password-input"]').fill(password);
await page.locator('[data-test="login-button"]').click();
await page.waitForURL(url => !url.pathname.endsWith('login/'), {
  timeout: 20000,
});

await page.goto('/chart/list/');
await page.waitForLoadState('networkidle');
await page.locator('a[href*="/explore/"]').first().click();
await page.waitForURL(/explore/);
await page.getByRole('button', { name: /Update chart/i }).waitFor({
  state: 'visible',
  timeout: 30000,
});

await page.screenshot({
  path: join(outDir, '01-explore-time-filter.png'),
  fullPage: false,
});

const trigger = page.locator('[data-test="time-range-trigger"]').first();
if (!(await trigger.isVisible())) {
  await page.getByText(/\(No filter\)/).first().click();
  await trigger.waitFor({ state: 'visible', timeout: 15000 });
}

await page.screenshot({
  path: join(outDir, '02-open-filter.png'),
  fullPage: false,
});

await trigger.click();
await page.getByText('Edit time range').waitFor({ state: 'visible' });
await page.locator('[data-test="Range type"]').click();
await page.getByText('Persian Calendar', { exact: true }).waitFor({
  state: 'visible',
});
await page.screenshot({
  path: join(outDir, '03-range-type-persian.png'),
  fullPage: false,
});

await page.getByText('Persian Calendar', { exact: true }).click();
await page.locator('[data-test="persian-frame"]').waitFor({ state: 'visible' });
await page.screenshot({
  path: join(outDir, '04-persian-presets.png'),
  fullPage: false,
});

await page.getByRole('radio', { name: /Custom range/i }).click();
await page.locator('.jalali-date-input').first().waitFor({ state: 'visible' });
await page.locator('.jalali-date-input').first().click();
await page.waitForTimeout(500);
await page.screenshot({
  path: join(outDir, '05-custom-jalali-picker.png'),
  fullPage: false,
});

await browser.close();
console.log(`Wrote screenshots to ${outDir}`);
