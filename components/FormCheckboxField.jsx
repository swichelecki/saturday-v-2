import { Checkbox } from 'components';

const FormCheckboxField = ({
  label,
  subLabel,
  id,
  checked,
  onChangeHandler,
}) => {
  return (
    <div className='form-field'>
      <Checkbox
        label={label}
        subLabel={subLabel}
        id={id}
        checked={checked}
        onChangeHandler={onChangeHandler}
      />
    </div>
  );
};

export default FormCheckboxField;
