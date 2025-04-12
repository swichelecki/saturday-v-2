const Checkbox = ({
  label,
  subLabel = '',
  id = 'checkbox',
  name,
  checked,
  onChangeHandler,
}) => {
  return (
    <>
      <label className='checkbox__checkbox-container' htmlFor={id}>
        <span>{label}</span>
        <input
          type='checkbox'
          id={id}
          name={name}
          checked={checked}
          onChange={onChangeHandler}
        />
        <span className='checkbox__checkbox'></span>
      </label>
      {subLabel && <p className='checkbox__sublabel'>{subLabel}</p>}
    </>
  );
};

export default Checkbox;
