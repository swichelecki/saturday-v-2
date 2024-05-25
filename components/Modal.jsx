import { useEffect, useRef } from 'react';
import {
  MODAL_TYPE_REMINDER,
  MODAL_TYPE_CATEGORY,
  MODAL_TYPE_UPDATE_ITEM,
} from 'constants';

const Modal = ({ modalType, children }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    modalRef.current.showModal();
  }, []);

  return (
    <dialog
      ref={modalRef}
      className={`${
        modalType === MODAL_TYPE_REMINDER ||
        modalType === MODAL_TYPE_CATEGORY ||
        modalType === MODAL_TYPE_UPDATE_ITEM
          ? 'modal__form-modal'
          : 'modal'
      }`}
    >
      {children}
    </dialog>
  );
};

export default Modal;
