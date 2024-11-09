'use client';

import { useEffect, useRef } from 'react';
import { useAppContext } from '../context';
import { IoClose } from 'react-icons/io5';

const Modal = ({ className, children, showCloseButton = true }) => {
  const modalRef = useRef(null);

  const { setShowModal } = useAppContext();

  useEffect(() => {
    modalRef.current.showModal();
  }, []);

  return (
    <dialog ref={modalRef} className={`${className ? className : 'modal'}`}>
      {showCloseButton && (
        <button
          onClick={() => {
            setShowModal(null);
          }}
          type='button'
        >
          <IoClose />
        </button>
      )}
      {children}
    </dialog>
  );
};

export default Modal;
