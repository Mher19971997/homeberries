import React, { useState, useRef, useEffect, useContext } from 'react';
import InputMask from 'react-input-mask';
import {
  expirationDate,
  expirationMonth,
  expirationYear
} from 'card-validator';
import { InputProps } from '@homeberris/types/helper.types';
import { ExpirationDateVerification } from 'card-validator/dist/expiration-date';
import { ExpirationMonthVerification } from 'card-validator/dist/expiration-month';
import { ExpirationYearVerification } from 'card-validator/dist/expiration-year';
import { CreditCardDataContext } from './CredtCardInput';
import { TextField } from '@mui/material';

const DateInput = ({ focus, tabIndex, leaveFieldCallback }: InputProps) => {
  const absLenght = (value: any): number =>
    value
      .split('')
      .map((item: any) => parseInt(item))
      .filter((item: any) => !isNaN(item)).length;
  const [error, setError] = useState(false);
  const [info, setInfo] = useState('');
  const inputRef = useRef<HTMLInputElement>(null!);

  const CardContext = useContext(CreditCardDataContext);

  const handleChange = (event: any) => {
    const value: any = event?.target?.value;
    const epirationDate: ExpirationDateVerification = expirationDate(value);
    const epirationMonth: ExpirationMonthVerification = expirationMonth(value);
    const epirationYear: ExpirationYearVerification = expirationYear(value);
    const DateLength = absLenght(value);

    if (DateLength > 0 && !epirationMonth.isPotentiallyValid) {
      setInfo('Wrong month data');
      setError(true);
    } else if (DateLength > 0 && !epirationYear.isPotentiallyValid) {
      setInfo('Wrong year data');
      setError(true);
    } else if (DateLength > 0 && !epirationDate.isValid) {
      setInfo('Wrong data');
      setError(true);
    } else {
      setInfo('');
      setError(false);
    }
    if (epirationDate.isValid && typeof leaveFieldCallback === 'function') {
      leaveFieldCallback(tabIndex + 1);
    }
  };

  const handleBlur = (event: any) => {
    const value: any = event?.target?.value;
    const epirationDate: ExpirationDateVerification = expirationDate(value);
    if (epirationDate.isValid) {
      setError(false);
      setInfo('');
      CardContext?.setCardData({
        ...CardContext.cardData,
        date: {
          moth: epirationDate.month,
          year: epirationDate.year
        }
      });
    } else {
      setError(true);
    }
  };

  useEffect(() => {
    if (focus) {
      inputRef.current.focus();
    }
  }, [focus]);

  return (
    <InputMask
      mask='99 / 99'
      maskChar=' '
      onChange={handleChange}
      onBlur={handleBlur}
      tabIndex={tabIndex}
    >
      {() => (
        <TextField
          name='expire'
          label='expire date'
          type='text'
          error={error}
          helperText={info}
          autoFocus={focus}
          required
          inputRef={inputRef}
        />
      )}
    </InputMask>
  );
};

export default DateInput;
