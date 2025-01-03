'use client';

import { useState } from 'react';
import { useAppContext } from '../context';
import { handleModalResetPageScrolling } from '../utilities';

const ModalConfirm = ({
  handleConfirm,
  confirmId,
  confirmBtnText,
  className,
}) => {
  const { setShowModal } = useAppContext();

  const [isAwaitingConfirmResponse, setIsAwaitingConfirmResponse] =
    useState(false);

  const handleCloseModal = () => {
    setShowModal(null);
    handleModalResetPageScrolling();
  };

  return (
    <div className='modal__modal-button-wrapper'>
      <button onClick={handleCloseModal} className='modal__cancel-button'>
        Cancel
      </button>
      <button
        onClick={() => {
          setIsAwaitingConfirmResponse(true);
          handleConfirm(confirmId);
        }}
        className={className ? className : 'modal__delete-button'}
      >
        {isAwaitingConfirmResponse && <div className='loader'></div>}
        {confirmBtnText}
      </button>
    </div>
  );
};

export default ModalConfirm;
