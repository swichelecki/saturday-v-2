const Tooltip = ({ icon, children }) => {
  return (
    <div className='tooltip'>
      {icon}
      <span className='tooltip__tooltip-message'>{children}</span>
    </div>
  );
};

export default Tooltip;
