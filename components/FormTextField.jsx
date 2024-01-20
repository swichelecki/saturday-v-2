import { FormErrorMessage } from 'components';

const FormTextField = ({
  label,
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
      <label htmlFor={id}>{label}</label>
      <input
        type={type}
        id={id}
        name={name}
        value={value}
        onChange={onChangeHandler}
        disabled={disabled}
      />
      {errorMessage && <FormErrorMessage errorMessage={errorMessage} />}
    </div>
  );
};

export default FormTextField;
