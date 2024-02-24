import { useState, useEffect, useRef } from 'react';
import { FormTextField, FormCheckboxField } from 'components';
import { SETTINGS_MISSING_CATEGORY } from 'constants';

const ModalReminder = ({
  form,
  onChangeHandlerTextField,
  onChangeHandlerCheckbox,
  handleItemOperation,
  handleCancelButton,
  modalRef,
}) => {
  const pageRef = useRef(null);

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

  const handleCloseModal = () => {
    modalRef.current.close();
    handleCancelButton(false);
    setErrorMessage({ type: '' });
  };

  const handleSubmitCategory = () => {
    if (!form.type) {
      setErrorMessage({ type: SETTINGS_MISSING_CATEGORY });
      setIsAwaitingSubmitResponse(false);
      return;
    }

    handleItemOperation();
  };

  return (
    <div ref={pageRef}>
      <FormTextField
        label={'Category'}
        type={'text'}
        id={'category'}
        name={'type'}
        value={form?.type}
        onChangeHandler={onChangeHandlerTextField}
        errorMessage={errorMessage.type}
      />
      <FormCheckboxField
        label={'Date or Date & Time'}
        id={'categoryDateTimeCheckbox'}
        checked={form?.mandatoryDate}
        onChangeHandler={onChangeHandlerCheckbox}
      />
      <div className='modal__modal-button-wrapper'>
        <button onClick={handleCloseModal} className='modal__cancel-button'>
          Cancel
        </button>
        <button
          className='modal__save-button'
          onClick={() => {
            setIsAwaitingSubmitResponse(true);
            handleSubmitCategory();
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
