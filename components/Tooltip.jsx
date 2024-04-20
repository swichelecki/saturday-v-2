const Tooltip = ({ icon, message }) => {
  return (
    <button className='tooltip'>
      {icon}
      <span
        className='tooltip__tooltip-text'
        dangerouslySetInnerHTML={{ __html: message }}
      ></span>
    </button>
  );
};

export default Tooltip;
