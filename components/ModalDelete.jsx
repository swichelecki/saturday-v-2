import { useState } from 'react';

const ModalDelete = ({ handleDeleteItem, modalIdToDelete, modalRef }) => {
  const [isAwaitingDeleteResponse, setIsAwaitingDeleteResponse] =
    useState(false);

  const handleCloseModal = () => {
    modalRef.current.close();
  };

  return (
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
  );
};

export default ModalDelete;
