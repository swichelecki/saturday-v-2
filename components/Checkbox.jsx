import { TYPE_UPCOMING } from 'constants';

const Checkbox = ({
  label,
  subLabel = '',
  id = 'checkbox',
  type = 'default',
  checked,
  onChangeHandler,
}) => {
  return (
    <>
      <label
        className='checkbox__checkbox-container'
        htmlFor={id}
        style={type === TYPE_UPCOMING && checked ? { cursor: 'no-drop' } : {}}
      >
        <span>{label}</span>
        <input
          type='checkbox'
          id={id}
          onChange={onChangeHandler}
          checked={checked}
        />
        <span className='checkbox__checkbox'></span>
      </label>
      {subLabel && <p className='checkbox__sublabel'>{subLabel}</p>}
    </>
  );
};

export default Checkbox;
