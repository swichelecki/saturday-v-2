import { useState, useEffect, useRef } from 'react';

const Modal = ({ handleDeleteItem, modalIdToDelete }) => {
  const modalRef = useRef(null);

  const [isAwaitingDeleteResponse, setIsAwaitingDeleteResponse] =
    useState(false);

  useEffect(() => {
    modalRef.current.showModal();
  });

  const handleCloseModal = () => {
    modalRef.current.close();
  };

  return (
    <dialog ref={modalRef}>
      <h2>Confirm Deletion</h2>
      <div className='modal__modal-button-wrapper'>
        <button onClick={handleCloseModal} className='modal__cancel-button'>
          Cancel
        </button>
        <button
          onClick={() => {
            setIsAwaitingDeleteResponse(true);
            handleDeleteItem(modalIdToDelete);
          }}
          className='modal__delete-button'
        >
          {isAwaitingDeleteResponse && <div className='loader'></div>}
          Delete
        </button>
      </div>
    </dialog>
  );
};

export default Modal;
