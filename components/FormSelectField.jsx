'use client';

import { useState, useEffect } from 'react';
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
  const [optionValue, setOptionValue] = useState('');

  useEffect(() => {
    setOptionValue(value);
  }, [value]);

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
          {!optionValue && (
            <option hidden key='form-select-option_hidden'>
              Select
            </option>
          )}
          {options?.map((item, index) => (
            <>
              {optionValue && optionValue === item?.value ? (
                <option
                  key={`form-select-option_${id}_${index}`}
                  value={JSON.stringify(item)}
                  selected
                >
                  {item?.title}
                </option>
              ) : (
                <>
                  <option
                    key={`form-select-option_${id}_${index}`}
                    value={JSON.stringify(item)}
                  >
                    {item?.title}
                  </option>
                </>
              )}
            </>
          ))}
        </select>
      </div>
      {errorMessage && <FormErrorMessage errorMessage={errorMessage} />}
      <input type='hidden' name={name} value={optionValue} />
    </div>
  );
};

export default FormSelectField;
