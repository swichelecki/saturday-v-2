'use client';

import { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../context';
import { createNote, updateNote } from '../../actions';
import { useScrollToError } from '../../hooks';
import { FormTextField, FormWYSIWYGField, Toast } from '../../components';
import { handleModalResetPageScrolling } from '../../utilities';
import { noteSchema } from '../../schemas/schemas';

const ModalNotes = ({
  userId,
  items,
  setItems,
  itemToUpdate,
  itemToEditId,
  numberOfItems,
}) => {
  const formRef = useRef(null);

  const { setShowModal, setShowToast } = useAppContext();

  const isUpdate = !!Object.keys(itemToUpdate ?? {}).length;

  const [form, setForm] = useState({
    _id: itemToUpdate?._id ?? '',
    userId: itemToUpdate?.userId ?? userId,
    title: itemToUpdate?.title ?? '',
    description: itemToUpdate?.description ?? '',
    date: itemToUpdate?.date ?? '',
    pinned: itemToUpdate?.pinned ?? false,
    pinnedDate: itemToUpdate?.pinnedDate ?? '',
    confirmDeletion: itemToUpdate?.confirmDeletion ?? true,
    type: itemToUpdate?.type ?? '',
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
      type: formData.get('type'),
      confirmDeletion: formData.get('confirmDeletion'),
      itemLimit: isUpdate ? numberOfItems - 1 : numberOfItems,
    });

    const { success, error } = noteSchemaValidated;
    if (!success) {
      const { title, description } = error.flatten().fieldErrors;

      if (!title && !description) {
        const serverError = {
          status: 400,
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
            setItems(
              items.map((item) => {
                if (Object.keys(item)[0] === res.item.type) {
                  return {
                    [Object.keys(item)[0]]: Object.values(item)[0].map(
                      (item) => {
                        if (item._id === itemToEditId) {
                          return {
                            ...item,
                            title: res.item.title,
                            description: res.item.description,
                          };
                        } else {
                          return item;
                        }
                      }
                    ),
                  };
                } else {
                  return item;
                }
              })
            );
            // TODO: put function into utility
            //if (width <= MOBILE_BREAKPOINT) handleItemsTouchReset();
          }

          if (res.status !== 200) {
            setShowToast(<Toast serverError={res} />);
          }

          handleCloseModal();
        })
      : createNote(formData).then((res) => {
          if (res.status === 200) {
            setItems(
              items.map((item) => {
                if (Object.keys(item)[0] === res.item.type) {
                  return {
                    [Object.keys(item)[0]]: [
                      res.item,
                      ...Object.values(item)[0],
                    ],
                  };
                } else {
                  return {
                    [Object.keys(item)[0].type]: Object.values(item)[0],
                  };
                }
              })
            );
            // TODO: put function into utility
            //if (width <= MOBILE_BREAKPOINT) handleItemsTouchReset();
          }

          if (res.status !== 200) {
            setShowToast(<Toast serverError={res} />);
          }

          handleCloseModal();
        });
  };

  const handleCloseModal = () => {
    setIsAwaitingSubmitResponse(false);
    setShowModal(null);
    setForm({
      _id: '',
      userId,
      title: '',
      description: '',
      date: '',
      pinned: false,
      pinnedDate: '',
      confirmDeletion: true,
      type: '',
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
      <input type='hidden' name='_id' value={itemToEditId || ''} />
      <input type='hidden' name='userId' value={form?.userId || userId} />
      <input type='hidden' name='description' value={form?.description} />
      <input
        type='hidden'
        name='date'
        value={form?.date || new Date().toISOString()}
      />
      <input type='hidden' name='pinned' value={form.pinned || 'false'} />
      <input
        type='hidden'
        name='pinnedDate'
        value={form?.pinnedDate || new Date().toISOString()}
      />
      <input
        type='hidden'
        name='type'
        value={form?.type || new Date().getFullYear()}
      />
      <input type='hidden' name='confirmDeletion' value='true' />
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
