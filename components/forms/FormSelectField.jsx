'use client';

import { FormErrorMessage } from '../';

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
  return (
    <div className={`form-field${errorMessage ? ' form-field--error' : ''}`}>
      <label htmlFor={id}>{label}</label>
      {subLabel && <p className='form-field__sublabel'>{subLabel}</p>}
      <div className='form-field__select-wrapper'>
        <select
          onChange={(e) => {
            onChangeHandler(name, e.target.value);
          }}
          disabled={disabled}
          value={value}
          id={id}
        >
          {!value && <option hidden>Select</option>}
          {options?.map((item, index) => (
            <option
              key={`form-select-option_${id}_${index}`}
              value={item?.value}
            >
              {item?.title}
            </option>
          ))}
        </select>
      </div>
      {errorMessage && <FormErrorMessage errorMessage={errorMessage} />}
    </div>
  );
};

export default FormSelectField;
