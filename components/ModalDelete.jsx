import { useState, useEffect } from 'react';
import { useAppContext } from 'context';

const ModalDelete = ({ handleDeleteItem, modalIdToDelete }) => {
  const { setShowModal } = useAppContext();

  const [isAwaitingDeleteResponse, setIsAwaitingDeleteResponse] =
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
