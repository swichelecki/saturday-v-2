'use client';

import { useState, useRef } from 'react';
import { useAppContext } from '../../context';
import { createNote, updateNote } from '../../actions';
import {
  useInnerWidth,
  useListItemsMobileReset,
  useScrollToError,
  useCloseListItemsYAxis,
} from '../../hooks';
import { FormTextField, FormWYSIWYGField, Toast } from '../../components';
import { handleModalResetPageScrolling } from '../../utilities';
import { noteSchema } from '../../schemas/schemas';
import { MOBILE_BREAKPOINT } from '../../constants';

const ModalNotes = ({
  userId,
  items,
  setItems,
  itemToUpdate,
  numberOfItems,
  isSearching,
  handleClearSearch,
  setCurrentNoteCount,
}) => {
  const { setShowModal, setShowToast } = useAppContext();

  const width = useInnerWidth();
  const handleListItemsMobileReset = useListItemsMobileReset();
  const handleCloseListItemsYAxis = useCloseListItemsYAxis();

  const formRef = useRef(null);

  const isUpdate = !!Object.keys(itemToUpdate ?? {}).length;

  const [form, setForm] = useState({
    _id: itemToUpdate?._id ?? '',
    userId: itemToUpdate?.userId ?? userId,
    title: itemToUpdate?.title ?? '',
    description: itemToUpdate?.description ?? '',
    date: itemToUpdate?.date ?? new Date().toISOString(),
    pinned: itemToUpdate?.pinned ?? false,
    pinnedDate: itemToUpdate?.pinnedDate ?? new Date().toISOString(),
    confirmDeletion: itemToUpdate?.confirmDeletion ?? true,
    type: itemToUpdate?.type ?? new Date().getFullYear().toString(),
    confirmDeletion: itemToUpdate?.confirmDeletion ?? true,
    itemLimit: isUpdate ? numberOfItems - 1 : numberOfItems,
  });
  const [errorMessage, setErrorMessage] = useState({
    title: '',
    description: '',
  });
  const [scrollToErrorMessage, setScrollToErrorMessage] = useState(false);
  const [isAwaitingSubmitResponse, setIsAwaitingSubmitResponse] =
    useState(false);

  useScrollToError(formRef, scrollToErrorMessage, setScrollToErrorMessage);

  // state handlers
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

  // create or update
  const onSubmit = (e) => {
    e.preventDefault();

    const zodValidationResults = noteSchema.safeParse(form);
    const { data: zodFormData, success, error } = zodValidationResults;
    if (!success) {
      const { title, description } = error.flatten().fieldErrors;

      if (!title && !description) {
        const serverError = {
          status: 400,
          error: 'Zod validation failed. Check console',
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
      ? updateNote(zodFormData).then((res) => {
          if (res.status === 200) {
            setItems(
              items.map((item) => {
                if (Object.keys(item)[0] === res.item.type) {
                  return {
                    [Object.keys(item)[0]]: Object.values(item)[0].map(
                      (item) => {
                        if (item._id === itemToUpdate?._id) {
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

            if (width <= MOBILE_BREAKPOINT) handleListItemsMobileReset();
          }

          if (res.status !== 200) {
            setShowToast(<Toast serverError={res} />);
          }

          handleCloseModal();
        })
      : createNote(zodFormData).then((res) => {
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
                  return item;
                }
              })
            );

            if (width <= MOBILE_BREAKPOINT) handleListItemsMobileReset();
            setCurrentNoteCount((curr) => curr + 1);
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
    isSearching ? handleClearSearch() : handleCloseListItemsYAxis();
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
        hasToobar={false}
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
