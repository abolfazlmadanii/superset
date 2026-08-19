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
import { Page } from '@playwright/test';
import { AuthPage } from './AuthPage';

const USERNAME = process.env.SUPERSET_ADMIN_USERNAME || 'admin';
const PASSWORDS = [
  process.env.SUPERSET_ADMIN_PASSWORD,
  'admin',
  'general',
].filter((value): value is string => Boolean(value));

export class ExploreTimeFilterPage {
  private static readonly SELECTORS = {
    TIME_RANGE_TRIGGER: '[data-test="time-range-trigger"]',
    PERSIAN_FRAME: '[data-test="persian-frame"]',
    APPLY_BUTTON: '[data-test="date-filter-control__apply-button"]',
    RANGE_TYPE: '[data-test="Range type"]',
  } as const;

  constructor(private readonly page: Page) {}

  async loginToApp(): Promise<void> {
    const authPage = new AuthPage(this.page);
    await authPage.goto();
    await authPage.waitForLoginForm();

    let lastError: unknown;
    for (const password of [...new Set(PASSWORDS)]) {
      await authPage.loginWithCredentials(USERNAME, password);
      try {
        await this.page.waitForURL(
          url => !url.pathname.endsWith('login/'),
          { timeout: 12000 },
        );
        return;
      } catch (error) {
        lastError = error;
        if (this.page.url().includes('login')) {
          await authPage.goto();
          await authPage.waitForLoginForm();
        }
      }
    }
    throw lastError ?? new Error('Unable to log in to Docker Superset');
  }

  async openFirstChart(): Promise<void> {
    await this.page.goto('/chart/list/');
    await this.page.waitForLoadState('networkidle');
    const chartLink = this.page.locator('a[href*="/explore/"]').first();
    await chartLink.waitFor({ state: 'visible', timeout: 20000 });
    await chartLink.click();
    await this.page.waitForURL(/explore/, { timeout: 20000 });
    await this.page
      .getByRole('button', { name: /Update chart/i })
      .waitFor({ state: 'visible', timeout: 30000 });
  }

  async openTimeRangePopover(): Promise<void> {
    const trigger = this.page
      .locator(ExploreTimeFilterPage.SELECTORS.TIME_RANGE_TRIGGER)
      .first();

    // Newer Explore charts expose DateFilterControl inside a temporal adhoc filter
    // (e.g. "ts (No filter)") instead of a dedicated TIME_RANGE control.
    if (!(await trigger.isVisible())) {
      await this.page.getByText(/\(No filter\)/).first().click();
      await trigger.waitFor({ state: 'visible', timeout: 15000 });
    }

    await trigger.click();
    await this.page.getByText('Edit time range').waitFor({ state: 'visible' });
  }

  async selectPersianCalendar(): Promise<void> {
    await this.page.locator(ExploreTimeFilterPage.SELECTORS.RANGE_TYPE).click();
    await this.page.getByText('Persian Calendar', { exact: true }).click();
    await this.page
      .locator(ExploreTimeFilterPage.SELECTORS.PERSIAN_FRAME)
      .waitFor({ state: 'visible' });
  }

  persianFrame() {
    return this.page.locator(ExploreTimeFilterPage.SELECTORS.PERSIAN_FRAME);
  }

  async applyTimeRange(): Promise<void> {
    await this.page
      .locator(ExploreTimeFilterPage.SELECTORS.APPLY_BUTTON)
      .click();
    const saveFilter = this.page.locator(
      '[data-test="adhoc-filter-edit-popover-save-button"]',
    );
    if (await saveFilter.isVisible()) {
      await saveFilter.click();
    }
  }
}
