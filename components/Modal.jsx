import { useEffect, useRef } from 'react';

const Modal = ({ className, children }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    modalRef.current.showModal();
    window.scrollTo(0, 0);
  }, []);

  return (
    <dialog
      ref={modalRef}
      className={`${className !== undefined ? className : 'modal'}`}
    >
      {children}
    </dialog>
  );
};

export default Modal;
