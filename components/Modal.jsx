import { useEffect, useRef } from 'react';

const Modal = ({ className, children }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    modalRef.current.showModal();
  }, []);

  const getModalClassName = (className) => {
    return className !== undefined ? `modal ${className}` : 'modal';
  };

  return (
    <dialog ref={modalRef} className={getModalClassName(className)}>
      {children}
    </dialog>
  );
};

export default Modal;
