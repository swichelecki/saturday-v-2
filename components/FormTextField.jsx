'use client';

import { FormErrorMessage } from './';
import moment from 'moment-timezone';

const FormTextField = ({
  label = '',
  subLabel = '',
  type,
  id,
  name,
  value,
  onChangeHandler,
  errorMessage,
  disabled = false,
}) => {
  return (
    <div className={`form-field${errorMessage ? ' form-field--error' : ''}`}>
      {label && <label htmlFor={id}>{label}</label>}
      {subLabel && <p className='form-field__sublabel'>{subLabel}</p>}
      <input
        type={type}
        id={id}
        name={name}
        value={
          type === 'date'
            ? value?.split('T')[0]
            : type === 'datetime-local'
            ? moment(value).tz('America/Chicago').format('yyyy-MM-DDTHH:mm')
            : value
        }
        onChange={onChangeHandler}
        disabled={disabled}
      />
      {errorMessage && <FormErrorMessage errorMessage={errorMessage} />}
    </div>
  );
};

export default FormTextField;
