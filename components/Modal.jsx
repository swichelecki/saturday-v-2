import { useEffect, useRef } from 'react';
import { ModalReminders, ModalCategory, ModalDelete } from 'components';
import { MODAL_TYPE_REMINDER, MODAL_TYPE_CATEGORY } from 'constants';

const Modal = ({
  form,
  onChangeHandlerTextField = () => {},
  onChangeHandlerSelectField = () => {},
  onChangeHandlerCheckbox = () => {},
  handleItemOperation = () => {},
  handleDeleteItem = () => {},
  handleCancelButton = () => {},
  modalIdToDelete = '',
  modalType,
  modalOperation,
  headlineText,
}) => {
  const modalRef = useRef(null);

  useEffect(() => {
    modalRef.current.showModal();
  });

  return (
    <dialog
      ref={modalRef}
      className={`${
        modalType === MODAL_TYPE_REMINDER || modalType === MODAL_TYPE_CATEGORY
          ? 'modal__form-modal'
          : 'modal'
      }`}
    >
      <h2>{headlineText}</h2>
      {modalType === MODAL_TYPE_REMINDER ? (
        <ModalReminders
          form={form}
          onChangeHandlerTextField={onChangeHandlerTextField}
          onChangeHandlerSelectField={onChangeHandlerSelectField}
          onChangeHandlerCheckbox={onChangeHandlerCheckbox}
          handleItemOperation={handleItemOperation}
          handleCancelButton={handleCancelButton}
          modalRef={modalRef}
          modalOperation={modalOperation}
        />
      ) : modalType === MODAL_TYPE_CATEGORY ? (
        <ModalCategory
          form={form}
          onChangeHandlerTextField={onChangeHandlerTextField}
          onChangeHandlerCheckbox={onChangeHandlerCheckbox}
          handleItemOperation={handleItemOperation}
          handleCancelButton={handleCancelButton}
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
