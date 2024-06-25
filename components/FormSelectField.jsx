'use client';

import { useState } from 'react';
import { FormErrorMessage } from './';

const FormSelectField = ({
  label,
  subLabel = '',
  id,
  name,
  value,
  onChangeHandler,
  options,
  errorMessage,
  disabled = false,
}) => {
  const [optionValue, setOptionValue] = useState(value ?? '');
  return (
    <div className={`form-field${errorMessage ? ' form-field--error' : ''}`}>
      <label htmlFor={id}>{label}</label>
      {subLabel && <p className='form-field__sublabel'>{subLabel}</p>}
      <div className='form-field__select-wrapper'>
        <select
          onChange={(e) => {
            const option = JSON.parse(e.currentTarget.value);
            onChangeHandler(option?.name, option?.value);
            setOptionValue(option?.value);
          }}
          disabled={disabled}
          defaultValue={value}
          id={id}
        >
          {value ? (
            <option value='' hidden>
              {value}
            </option>
          ) : (
            <option value='' disabled hidden>
              Select
            </option>
          )}
          {options?.map((item, index) => (
            <option
              key={`form-select-option_${id}_${index}`}
              value={JSON.stringify(item)}
            >
              {item?.title}
            </option>
          ))}
        </select>
      </div>
      {errorMessage && <FormErrorMessage errorMessage={errorMessage} />}
      <input type='hidden' name={name} value={optionValue || 0} />
    </div>
  );
};

export default FormSelectField;
