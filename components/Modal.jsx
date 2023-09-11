import { forwardRef } from 'react';

const Modal = forwardRef(
  (
    { handleDeleteTask, modalIdToDelete, isAwaitingDeleteResponse },
    modalRef
  ) => {
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
              handleDeleteTask(modalIdToDelete, false);
            }}
            className='modal__delete-button'
          >
            {isAwaitingDeleteResponse && <div className='loader'></div>}
            Delete
          </button>
        </div>
      </dialog>
    );
  }
);

export default Modal;
