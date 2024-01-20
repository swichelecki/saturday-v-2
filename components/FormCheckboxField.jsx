import { Checkbox } from 'components';

const FormCheckboxField = ({ label, checked, onChangeHandler }) => {
  return (
    <div className='form-field'>
      <Checkbox
        label={label}
        checked={checked}
        onChangeHandler={onChangeHandler}
      />
    </div>
  );
};

export default FormCheckboxField;
