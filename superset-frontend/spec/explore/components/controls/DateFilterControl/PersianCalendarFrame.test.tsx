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
import {
  screen,
  render,
  fireEvent,
  userEvent,
  waitFor,
} from 'spec/helpers/testing-library';
import {
  extendedDayjs as dayjs,
  type Dayjs,
} from '@superset-ui/core/utils/dates';
import type { JalaliDatePickerProps } from 'src/explore/components/controls/DateFilterControl/components/JalaliDatePicker';
import { PersianCalendarFrame } from 'src/explore/components/controls/DateFilterControl/components/PersianCalendarFrame';

jest.mock(
  'src/explore/components/controls/DateFilterControl/components/JalaliDatePicker',
  () => {
    const { extendedDayjs } = jest.requireActual(
      '@superset-ui/core/utils/dates',
    );
    const parseDate = (input: string) =>
      input ? extendedDayjs(input, 'YYYY-MM-DD') : null;
    return {
      JalaliDatePicker: ({
        value,
        onChange,
        placeholder,
        mode,
      }: JalaliDatePickerProps) => {
        if (mode === 'range') {
          const [start, end] = (value as [Dayjs | null, Dayjs | null]) ?? [
            null,
            null,
          ];
          return (
            <div>
              <input
                aria-label={`${placeholder}-start`}
                value={start ? start.format('YYYY-MM-DD') : ''}
                onChange={event =>
                  onChange([parseDate(event.target.value), end ?? null])
                }
              />
              <input
                aria-label={`${placeholder}-end`}
                value={end ? end.format('YYYY-MM-DD') : ''}
                onChange={event =>
                  onChange([start ?? null, parseDate(event.target.value)])
                }
              />
            </div>
          );
        }
        const singleValue = value as Dayjs | null;
        return (
          <input
            aria-label={placeholder}
            value={singleValue ? singleValue.format('YYYY-MM-DD') : ''}
            onChange={event => onChange(parseDate(event.target.value))}
          />
        );
      },
    };
  },
);

test('renders preset selection and applies relative range on change', async () => {
  const onChange = jest.fn();
  render(<PersianCalendarFrame value="Last 7 days" onChange={onChange} />);

  await userEvent.click(screen.getByRole('radio', { name: /Last 30 days/i }));

  expect(onChange).toHaveBeenCalledWith('Last 30 days');
});

test('emits custom range when both Jalali pickers are filled', async () => {
  const onChange = jest.fn();
  render(<PersianCalendarFrame value={NO_TIME_RANGE} onChange={onChange} />);

  await userEvent.click(screen.getByRole('radio', { name: /Custom range/i }));

  const startInput = screen.getByLabelText('Select date range-start');
  const endInput = screen.getByLabelText('Select date range-end');

  fireEvent.change(startInput, { target: { value: '2024-01-10' } });
  fireEvent.change(endInput, { target: { value: '2024-01-12' } });

  expect(onChange).toHaveBeenLastCalledWith('2024-01-10 : 2024-01-12');
});

test('parses persisted custom range values', () => {
  render(
    <PersianCalendarFrame
      value="2024-01-01 : 2024-01-05"
      onChange={jest.fn()}
    />,
  );

  expect(
    screen.getByText(/Selected Jalali range/i),
  ).toBeInTheDocument();
});

test('normalizes Jalali range strings to Gregorian inputs', () => {
  render(
    <PersianCalendarFrame
      value="1403-01-02 : 1403-01-04"
      onChange={jest.fn()}
    />,
  );

  expect(
    screen.getByLabelText('Select date range-start'),
  ).toHaveValue('2024-03-21');
  expect(screen.getByLabelText('Select date range-end')).toHaveValue(
    '2024-03-23',
  );
});

test('selects persisted relative range radio button', () => {
  render(<PersianCalendarFrame value="Last 365 days" onChange={jest.fn()} />);

  expect(
    screen.getByRole('radio', { name: /Last 365 days/i }),
  ).toBeChecked();
});

test('applies Last 7 days when the incoming value is not a Persian range', () => {
  const onChange = jest.fn();
  render(<PersianCalendarFrame value="Last week" onChange={onChange} />);

  expect(onChange).toHaveBeenCalledWith('Last 7 days');
});

test('swaps inverted custom ranges so start is before end', async () => {
  const onChange = jest.fn();
  render(<PersianCalendarFrame value={NO_TIME_RANGE} onChange={onChange} />);

  await userEvent.click(screen.getByRole('radio', { name: /Custom range/i }));

  fireEvent.change(screen.getByLabelText('Select date range-start'), {
    target: { value: '2024-01-20' },
  });
  fireEvent.change(screen.getByLabelText('Select date range-end'), {
    target: { value: '2024-01-10' },
  });

  expect(onChange).toHaveBeenLastCalledWith('2024-01-10 : 2024-01-20');
});

test('set start to today keeps an existing end date', async () => {
  const onChange = jest.fn();
  render(
    <PersianCalendarFrame
      value="2024-01-01 : 2024-01-05"
      onChange={onChange}
    />,
  );

  await userEvent.click(screen.getByRole('button', { name: /Set start to today/i }));

  const today = dayjs().format('YYYY-MM-DD');
  const expected =
    today > '2024-01-05' ? `2024-01-05 : ${today}` : `${today} : 2024-01-05`;
  expect(onChange).toHaveBeenLastCalledWith(expected);
});

test('custom range defaults both inputs to today when enabled', async () => {
  render(<PersianCalendarFrame value={NO_TIME_RANGE} onChange={jest.fn()} />);

  await userEvent.click(screen.getByRole('radio', { name: /Custom range/i }));

  const isoDate = dayjs().format('YYYY-MM-DD');
  await waitFor(() =>
    expect(
      screen.getByLabelText('Select date range-start'),
    ).toHaveValue(isoDate),
  );
  expect(
    screen.getByLabelText('Select date range-end'),
  ).toHaveValue(isoDate);
});
