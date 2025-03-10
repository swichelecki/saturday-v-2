import { Checkbox } from '..';

const FormCheckboxField = ({
  label,
  subLabel,
  id,
  name,
  checked,
  onChangeHandler,
}) => {
  return (
    <div className='form-field'>
      <Checkbox
        label={label}
        subLabel={subLabel}
        id={id}
        name={name}
        checked={checked}
        onChangeHandler={onChangeHandler}
      />
    </div>
  );
};

export default FormCheckboxField;
