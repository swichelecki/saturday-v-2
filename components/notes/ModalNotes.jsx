'use client';

import { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../context';
import { createNote, updateNote } from '../../actions';
import { useScrollToError } from '../../hooks';
import { FormTextField, FormWYSIWYGField, Toast } from '../../components';
import { handleModalResetPageScrolling } from '../../utilities';
import { noteSchema } from '../../schemas/schemas';

const ModalNotes = ({ note, userId, numberOfItems }) => {
  const formRef = useRef(null);

  const { setShowModal, setShowToast } = useAppContext();

  const isUpdate = !!Object.keys(note ?? {}).length;

  const [form, setForm] = useState({
    userId: note?.userId ?? userId,
    title: note?.title ?? '',
    description: note?.description ?? '',
    date: note?.date ?? '',
    pinned: note?.pinned ?? '',
    pinnedDate: note?.pinnedDate ?? '',
  });
  const [errorMessage, setErrorMessage] = useState({
    title: '',
    description: '',
  });
  const [scrollToErrorMessage, setScrollToErrorMessage] = useState(false);
  const [isAwaitingSubmitResponse, setIsAwaitingSubmitResponse] =
    useState(false);

  useScrollToError(formRef, scrollToErrorMessage, setScrollToErrorMessage);

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

  const handleForm = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    if (errorMessage[e.target.name]) {
      setErrorMessage({ ...errorMessage, [e.target.name]: '' });
    }
  };

  const handleQuill = (value) => {
    if (value === '<p><br></p>') {
      setForm({ ...form, description: '' });
      return;
    }

    setForm({ ...form, description: value });

    if (errorMessage['description']) {
      setErrorMessage({ ...errorMessage, description: '' });
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const noteSchemaValidated = noteSchema.safeParse({
      _id: formData.get('_id'),
      userId: formData.get('userId'),
      title: formData.get('title'),
      description: formData.get('description'),
      date: formData.get('date'),
      pinned: formData.get('pinned'),
      pinnedDate: formData.get('pinnedDate'),
      itemLimit: isUpdate ? numberOfItems - 1 : numberOfItems,
    });

    const { success, error } = noteSchemaValidated;
    if (!success) {
      const { title, description } = error.flatten().fieldErrors;

      if (!title && !description) {
        const serverError = {
          statu: 400,
          error: 'Invalid FormData. Check console',
        };
        setShowToast(<Toast serverError={serverError} />);
        console.error(error);
        return;
      }

      setErrorMessage({ title: title?.[0], description: description?.[0] });
      setScrollToErrorMessage(true);
      return;
    }

    setIsAwaitingSubmitResponse(true);
    isUpdate
      ? updateNote(formData).then((res) => {
          if (res.status === 200) {
            console.log('updated note: ', res);
            // TODO: update state and close modal
          }

          if (res.status !== 200) {
            setShowToast(<Toast serverError={res} />);
          }

          setIsAwaitingSubmitResponse(false);
          handleCloseModal();
        })
      : createNote(formData).then((res) => {
          if (res.status === 200) {
            console.log('new note: ', res);
            // TODO: update state and close modal
          }

          if (res.status !== 200) {
            setShowToast(<Toast serverError={res} />);
          }

          setIsAwaitingSubmitResponse(false);
          handleCloseModal();
        });
  };

  const handleCloseModal = () => {
    setShowModal(null);
    setForm({
      userId,
      title: '',
      description: '',
      date: '',
      pinned: false,
      pinnedDate: '',
    });
    setErrorMessage({ title: '', description: '' });
    handleModalResetPageScrolling();
  };

  return (
    <form onSubmit={onSubmit} ref={formRef}>
      <FormTextField
        label='Title'
        type='text'
        id='title'
        name='title'
        value={form?.title}
        onChangeHandler={handleForm}
        errorMessage={errorMessage.title}
      />

      <FormWYSIWYGField
        label='Description'
        value={form?.description}
        onChangeHandler={handleQuill}
        errorMessage={errorMessage.description}
      />
      {/* TODO: will need value={itemToEditId ?? ''} */}
      <input type='hidden' name='_id' value={''} />
      <input type='hidden' name='userId' value={note?.userId ?? userId} />
      <input type='hidden' name='description' value={form?.description} />
      <input
        type='hidden'
        name='date'
        value={note?.date ?? new Date().toISOString()}
      />
      <input type='hidden' name='pinned' value={note?.pinned ?? 'false'} />
      <input
        type='hidden'
        name='pinnedDate'
        value={note?.pinnedDate ?? new Date().toISOString()}
      />
      <div className='modal__modal-button-wrapper'>
        <button
          onClick={handleCloseModal}
          type='button'
          className='modal__cancel-button'
        >
          Cancel
        </button>
        <button
          type='submit'
          className={`modal__${isUpdate ? 'update' : 'save'}-button`}
        >
          {isAwaitingSubmitResponse && <div className='loader'></div>}
          {isUpdate ? 'Update' : 'Save'}
        </button>
      </div>
    </form>
  );
};

export default ModalNotes;
