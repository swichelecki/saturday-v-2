'use client';

import dynamic from 'next/dynamic';
import moment from 'moment-timezone';

const FormErrorMessage = dynamic(
  () => import('../../components/forms/FormErrorMessage'),
  {
    ssr: false,
  },
);

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
  timezone = '',
  showSpinner = false,
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
              ? moment(value).tz(timezone).format('yyyy-MM-DDTHH:mm')
              : value
        }
        onChange={onChangeHandler}
        disabled={disabled}
      />
      {errorMessage && <FormErrorMessage errorMessage={errorMessage} />}
      {showSpinner && <div className='loader'></div>}
    </div>
  );
};

export default FormTextField;
