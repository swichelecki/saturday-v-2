'use client';

import { useState, useEffect } from 'react';
import { useAppContext } from '../context';

const ModalConfirm = ({
  handleConfirm,
  confirmId,
  confirmBtnText,
  className,
}) => {
  const { setShowModal } = useAppContext();

  const [isAwaitingConfirmResponse, setIsAwaitingConfirmResponse] =
    useState(false);

  // handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') handleCloseModal();
    };

    if (document && typeof document !== 'undefined') {
      document.addEventListener('keydown', handleKeyDown);

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, []);

  const handleCloseModal = () => {
    setShowModal(null);
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
