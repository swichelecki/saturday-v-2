import { useState, useEffect, useRef } from 'react';
import { FormTextField, FormCheckboxField } from 'components';
import { createCategory } from '../services';
import { SETTINGS_MISSING_CATEGORY } from 'constants';

const ModalReminder = ({
  userId,
  items,
  setItems,
  setOpenCloseModal,
  modalRef,
}) => {
  const pageRef = useRef(null);

  const [form, setForm] = useState({
    userId,
    priority: '',
    type: '',
    mandatoryDate: false,
  });
  const [errorMessage, setErrorMessage] = useState({
    type: '',
  });
  const [isAwaitingSubmitResponse, setIsAwaitingSubmitResponse] =
    useState(false);

  useEffect(() => {
    if (!errorMessage.type) return;
    setErrorMessage({ type: '' });
  }, [form.type]);

  // handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') handleCloseModal();
      if (e.key === 'Enter') handleSubmitCategory();
    };

    if (document && typeof document !== 'undefined') {
      document.addEventListener('keydown', handleKeyDown);

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, []);

  // state handlers
  const handleForm = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
      priority: items?.length + 1,
    });
  };

  const handleMandatoryDate = (e) => {
    setForm({ ...form, mandatoryDate: e.target.checked });
  };

  // create category
  const handleCreateCategory = () => {
    if (!form.type) {
      setErrorMessage({ type: SETTINGS_MISSING_CATEGORY });
      setIsAwaitingSubmitResponse(false);
      return;
    }

    createCategory(form).then((res) => {
      if (res.status === 200) {
        setItems((current) => [...current, res.item]);
        setForm({ userId, priority: '', type: '', mandatoryDate: false });
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
    setOpenCloseModal(false);
    setForm({
      userId,
      priority: '',
      type: '',
      mandatoryDate: false,
    });
    setErrorMessage({ type: '' });
  };

  return (
    <div ref={pageRef}>
      <FormTextField
        label={'Category'}
        type={'text'}
        id={'category'}
        name={'type'}
        value={form?.type}
        onChangeHandler={handleForm}
        errorMessage={errorMessage.type}
      />
      <FormCheckboxField
        label={'Date or Date & Time'}
        id={'categoryDateTimeCheckbox'}
        checked={form?.mandatoryDate}
        onChangeHandler={handleMandatoryDate}
      />
      <div className='modal__modal-button-wrapper'>
        <button onClick={handleCloseModal} className='modal__cancel-button'>
          Cancel
        </button>
        <button
          className='modal__save-button'
          onClick={() => {
            setIsAwaitingSubmitResponse(true);
            handleCreateCategory();
          }}
        >
          {isAwaitingSubmitResponse && <div className='loader'></div>}
          Save
        </button>
      </div>
    </div>
  );
};

export default ModalReminder;
