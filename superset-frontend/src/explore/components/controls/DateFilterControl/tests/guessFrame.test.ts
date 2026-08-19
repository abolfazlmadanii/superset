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
import { NO_TIME_RANGE } from '@superset-ui/core';
import { PreviousCalendarWeek } from '../types';
import {
  guessFrame,
  isPersianDateOnlyRange,
  isPersianTimeRange,
} from '../utils';

test('maps common last-year to Common, not Persian', () => {
  expect(guessFrame('Last year')).toBe('Common');
});

test('maps Persian relative ranges to Persian', () => {
  expect(guessFrame('Last 7 days')).toBe('Persian');
  expect(guessFrame('Last 30 days')).toBe('Persian');
  expect(guessFrame('Last 90 days')).toBe('Persian');
  expect(guessFrame('Last 365 days')).toBe('Persian');
});

test('maps date-only Gregorian and Jalali ranges to Persian', () => {
  expect(guessFrame('2024-01-10 : 2024-01-12')).toBe('Persian');
  expect(guessFrame('1403-01-02 : 1403-01-04')).toBe('Persian');
  expect(isPersianDateOnlyRange('2024-01-10 : 2024-01-12')).toBe(true);
  expect(isPersianTimeRange('Last 7 days')).toBe(true);
});

test('keeps Custom ISO datetimes on Custom frame', () => {
  expect(guessFrame('2021-01-20T00:00:00 : 2021-01-27T00:00:00')).toBe(
    'Custom',
  );
});

test('maps remaining built-in frames', () => {
  expect(guessFrame('Last week')).toBe('Common');
  expect(guessFrame(PreviousCalendarWeek)).toBe('Calendar');
  expect(guessFrame('Current week')).toBe('Current');
  expect(guessFrame(NO_TIME_RANGE)).toBe('No filter');
  expect(guessFrame('today : tomorrow')).toBe('Advanced');
});
