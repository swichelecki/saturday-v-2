import { useEffect, useRef } from 'react';
import {
  ModalReminders,
  ModalCategory,
  ModalUpdateItem,
  ModalDelete,
} from 'components';
import {
  MODAL_TYPE_REMINDER,
  MODAL_TYPE_CATEGORY,
  MODAL_TYPE_UPDATE_ITEM,
} from 'constants';

const Modal = ({
  userId = '',
  items = [],
  itemToUpdate = '',
  itemToEditId = '',
  modalIdToDelete = '',
  modalType,
  modalOperation,
  headlineText,
  setItems = () => {},
  handleDeleteItem = () => {},
  setTaskToEditId = () => {},
  setOpenCloseModal = () => {},
}) => {
  const modalRef = useRef(null);

  useEffect(() => {
    modalRef.current.showModal();
  });

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
      <h2>{headlineText}</h2>
      {modalType === MODAL_TYPE_REMINDER ? (
        <ModalReminders
          userId={userId}
          items={items}
          setItems={setItems}
          itemToUpdate={itemToUpdate}
          itemToEditId={itemToEditId}
          setOpenCloseModal={setOpenCloseModal}
          modalOperation={modalOperation}
          modalRef={modalRef}
        />
      ) : modalType === MODAL_TYPE_CATEGORY ? (
        <ModalCategory
          userId={userId}
          items={items}
          setItems={setItems}
          setOpenCloseModal={setOpenCloseModal}
          modalRef={modalRef}
        />
      ) : modalType === MODAL_TYPE_UPDATE_ITEM ? (
        <ModalUpdateItem
          userId={userId}
          itemToUpdate={itemToUpdate}
          itemToEditId={itemToEditId}
          items={items}
          setItems={setItems}
          setTaskToEditId={setTaskToEditId}
          modalRef={modalRef}
        />
      ) : (
        <ModalDelete
          handleDeleteItem={handleDeleteItem}
          modalIdToDelete={modalIdToDelete}
          modalRef={modalRef}
        />
      )}
    </dialog>
  );
};

export default Modal;
