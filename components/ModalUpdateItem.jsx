import { useState, useEffect, useRef } from 'react';
import { FormTextField } from 'components';
import { updateTask } from '../services';
import { FORM_ERROR_MISSING_UPDATE_TITLE } from 'constants';

const ModalUpdateItem = ({
  userId,
  itemToUpdate,
  itemToEditId,
  items,
  setItems,
  modalRef,
  setTaskToEditId,
}) => {
  const pageRef = useRef(null);

  const [form, setForm] = useState({
    userId,
    title: '',
    column: 1,
    priority: 1,
    type: '',
    description: '',
    date: '',
    dateAndTime: '',
    mandatoryDate: false,
  });
  const [errorMessage, setErrorMessage] = useState({
    title: '',
  });
  const [isAwaitingSubmitResponse, setIsAwaitingSubmitResponse] =
    useState(false);

  useEffect(() => {
    if (!errorMessage.title) return;
    setErrorMessage({ ...errorMessage, title: '' });
  }, [form.title]);

  // handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') handleCloseModal();
      if (e.key === 'Enter') handleEditSubmit();
    };

    if (document && typeof document !== 'undefined') {
      document.addEventListener('keydown', handleKeyDown);

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [form]);

  // set state to item to update
  useEffect(() => {
    setForm(itemToUpdate);
  }, [itemToUpdate]);

  // state handlers
  const handleForm = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // edit item
  const handleEditSubmit = () => {
    if (!form?.title) {
      setErrorMessage({
        title: FORM_ERROR_MISSING_UPDATE_TITLE,
      });
      return;
    }

    setIsAwaitingSubmitResponse(true);
    updateTask(form).then((res) => {
      if (res.status === 200) {
        setItems(
          items?.map((item) => {
            if (item?._id === itemToEditId) {
              return {
                ...item,
                title: res?.item?.title,
              };
            } else {
              return item;
            }
          })
        );
      }

      if (res.status !== 200) {
        setServerError(res.status);
        setShowToast(true);
      }

      setIsAwaitingSubmitResponse(false);
      handleCloseModal();
    });
  };

  const handleCloseModal = () => {
    modalRef.current.close();
    setTaskToEditId('');
    setForm({
      userId,
      title: '',
      column: 1,
      priority: 1,
      type: '',
      description: '',
      date: '',
      dateAndTime: '',
      mandatoryDate: false,
    });
    setErrorMessage({
      item: '',
    });
  };

  return (
    <div ref={pageRef}>
      <FormTextField
        label={''}
        type={'text'}
        id={'update'}
        name={'title'}
        value={form?.title}
        onChangeHandler={handleForm}
        errorMessage={errorMessage.title}
      />
      <div className='modal__modal-button-wrapper'>
        <button onClick={handleCloseModal} className='modal__cancel-button'>
          Cancel
        </button>

        <button className='modal__update-button' onClick={handleEditSubmit}>
          {isAwaitingSubmitResponse && <div className='loader'></div>}
          Update
        </button>
      </div>
    </div>
  );
};

export default ModalUpdateItem;
