import React from 'react';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

const toDayjs = (date) => {
  if (!date) return null;
  if (dayjs.isDayjs(date)) return date;
  const parsed = dayjs(date);
  return parsed.isValid() ? parsed : null;
};

const Calendar = ({
  label = 'Select date',
  value = null,
  onChange,
  minDate,
  maxDate,
  disablePast = false,
  disableFuture = false,
  format = 'DD/MM/YYYY',
  textFieldProps = {},
  slotProps,
  ...props
}) => {
  const selectedDate = toDayjs(value);
  const min = toDayjs(minDate);
  const max = toDayjs(maxDate);

  const handleChange = (newValue) => {
    if (onChange) {
      if (newValue && newValue.isValid && newValue.isValid()) {
        onChange(newValue.toDate());
      } else {
        onChange(null);
      }
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        label={label}
        value={selectedDate}
        onChange={handleChange}
        minDate={min}
        maxDate={max}
        disablePast={disablePast}
        disableFuture={disableFuture}
        format={format}
        slotProps={{
          textField: {
            fullWidth: true,
            ...textFieldProps,
          },
          ...slotProps,
        }}
        {...props}
      />
    </LocalizationProvider>
  );
};

export default Calendar;
