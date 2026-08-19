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
import { test, expect } from '@playwright/test';
import { ExploreTimeFilterPage } from '../../pages/ExploreTimeFilterPage';

test.describe('Persian calendar date filter on Docker Superset', () => {
  test.setTimeout(120000);

  test('shows Persian Calendar in Explore time range and applies Last 30 days', async ({
    page,
  }) => {
    const explore = new ExploreTimeFilterPage(page);
    await explore.loginToApp();
    await explore.openFirstChart();
    await explore.openTimeRangePopover();
    await explore.selectPersianCalendar();

    await expect(explore.persianFrame()).toBeVisible();
    await expect(page.getByText('Persian calendar filter')).toBeVisible();

    await page.getByRole('radio', { name: /Last 30 days/i }).click();
    await explore.applyTimeRange();

    await expect(page.getByText(/Last 30 days/i).first()).toBeVisible();
  });

  test('keeps a custom Gregorian range after Jalali selection is applied', async ({
    page,
  }) => {
    const explore = new ExploreTimeFilterPage(page);
    await explore.loginToApp();
    await explore.openFirstChart();
    await explore.openTimeRangePopover();
    await explore.selectPersianCalendar();

    await page.getByRole('radio', { name: /Custom range/i }).click();
    await expect(page.locator('.jalali-date-input').first()).toBeVisible();
    await explore.applyTimeRange();

    await expect(
      page.locator('[data-test="time-range-trigger"]').first(),
    ).toBeVisible();
  });
});
