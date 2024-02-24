import { Checkbox } from 'components';

const FormCheckboxField = ({ label, id, checked, onChangeHandler }) => {
  return (
    <div className='form-field'>
      <Checkbox
        label={label}
        id={id}
        checked={checked}
        onChangeHandler={onChangeHandler}
      />
    </div>
  );
};

export default FormCheckboxField;
