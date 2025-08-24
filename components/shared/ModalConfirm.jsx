'use client';

import { useState } from 'react';
import { useAppContext } from '../../context';
import { CTA } from '../../components';
import { handleModalResetPageScrolling } from '../../utilities';

const ModalConfirm = ({ handleConfirm, confirmId, confirmType, className }) => {
  const { setShowModal } = useAppContext();

  const [isAwaitingConfirmResponse, setIsAwaitingConfirmResponse] =
    useState(false);

  const handleCloseModal = () => {
    setShowModal(null);
    handleModalResetPageScrolling();
  };

  return (
    <>
      <h2>Confirm {confirmType}</h2>
      <div className='modal__modal-button-wrapper'>
        <CTA
          text='Cancel'
          className='cta-button cta-button--medium cta-button--full cta-button--orange'
          ariaLabel='Close modal'
          handleClick={handleCloseModal}
        />
        <CTA
          text={confirmType}
          className={`cta-button cta-button--medium cta-button--full ${className}`}
          ariaLabel='Create dashboard item'
          showSpinner={isAwaitingConfirmResponse}
          handleClick={() => {
            setIsAwaitingConfirmResponse(true);
            handleConfirm(confirmId);
          }}
        />
      </div>
    </>
  );
};

export default ModalConfirm;
