const Checkbox = ({
  label,
  subLabel = '',
  id = 'checkbox',
  name,
  hasMandatoryDate,
  checked,
  onChangeHandler,
}) => {
  return (
    <>
      <label
        className='checkbox__checkbox-container'
        htmlFor={id}
        style={hasMandatoryDate && checked ? { cursor: 'no-drop' } : {}}
      >
        <span>{label}</span>
        <input
          type='checkbox'
          id={id}
          checked={checked}
          onChange={onChangeHandler}
        />
        <input type='hidden' name={name} value={checked ? true : false} />
        <span className='checkbox__checkbox'></span>
      </label>
      {subLabel && <p className='checkbox__sublabel'>{subLabel}</p>}
    </>
  );
};

export default Checkbox;
