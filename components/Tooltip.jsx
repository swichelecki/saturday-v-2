const Tooltip = ({ icon, message }) => {
  return (
    <div className='tooltip'>
      {icon}
      <span
        className='tooltip__tooltip-message'
        dangerouslySetInnerHTML={{ __html: message }}
      ></span>
    </div>
  );
};

export default Tooltip;
