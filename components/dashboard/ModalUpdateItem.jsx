'use client';

import { useState, useEffect } from 'react';
import { updateItem } from '../../actions';
import { useAppContext } from '../../context';
import { useInnerWidth, useListItemsMobileReset } from '../../hooks';
import { FormTextField, Toast } from '../../components';
import { itemSchema } from '../../schemas/schemas';
import { MOBILE_BREAKPOINT } from '../../constants';

const ModalUpdateItem = ({
  userId,
  itemToUpdate,
  itemToEditId,
  items,
  setItems,
  setTaskToEditId,
  totalNumberOfItems,
}) => {
  const { setShowModal, setShowToast } = useAppContext();

  const width = useInnerWidth();
  const handleListItemsMobileReset = useListItemsMobileReset();

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
  const [errorMessage, setErrorMessage] = useState('');
  const [isAwaitingSubmitResponse, setIsAwaitingSubmitResponse] =
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

    if (errorMessage) {
      setErrorMessage('');
    }
  };

  // edit item
  const handleEditSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const itemSchemaValidated = itemSchema.safeParse({
      _id: formData.get('_id'),
      userId: formData.get('userId'),
      title: formData.get('title'),
      column: formData.get('column'),
      priority: formData.get('priority'),
      type: formData.get('type'),
      description: formData.get('description'),
      date: formData.get('date'),
      dateAndTime: formData.get('dateAndTime'),
      mandatoryDate: formData.get('mandatoryDate'),
      confirmDeletion: formData.get('confirmDeletion'),
      isDetailsForm: formData.get('isDetailsForm'),
      itemLimit: totalNumberOfItems - 1,
    });

    const { success, error } = itemSchemaValidated;
    if (!success) {
      const { title } = error.flatten().fieldErrors;

      if (!title) {
        const serverError = {
          status: 400,
          error: 'Invalid FormData. Check console.',
        };
        setShowToast(<Toast serverError={serverError} />);
        console.error(error);
        return;
      }

      setErrorMessage(title?.[0]);
      return;
    }

    setIsAwaitingSubmitResponse(true);
    updateItem(formData).then((res) => {
      if (res.status === 200) {
        setItems(
          items.map((item) => {
            if (Object.keys(item)[0] === res.item.type) {
              return {
                [Object.keys(item)[0]]: Object.values(item)[0].map((item) => {
                  if (item._id === itemToEditId) {
                    return {
                      ...item,
                      title: res.item.title,
                    };
                  } else {
                    return item;
                  }
                }),
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

      setIsAwaitingSubmitResponse(false);
      handleCloseModal();
    });
  };

  const handleCloseModal = () => {
    setShowModal(null);
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
    <form onSubmit={handleEditSubmit}>
      <FormTextField
        type='text'
        id='update'
        name='title'
        value={form?.title}
        onChangeHandler={handleForm}
        errorMessage={errorMessage}
      />
      <div className='modal__modal-button-wrapper'>
        <button
          onClick={handleCloseModal}
          type='button'
          className='modal__cancel-button'
        >
          Cancel
        </button>

        <button type='submit' className='modal__update-button'>
          {isAwaitingSubmitResponse && <div className='loader'></div>}
          Update
        </button>
      </div>
      <input type='hidden' name='userId' value={userId} />
      <input type='hidden' name='_id' value={itemToUpdate?._id} />
      <input type='hidden' name='column' value={itemToUpdate?.column} />
      <input type='hidden' name='priority' value={itemToUpdate?.priority} />
      <input type='hidden' name='type' value={itemToUpdate?.type} />
      <input type='hidden' name='description' value='' />
      <input type='hidden' name='date' value='' />
      <input type='hidden' name='dateAndTime' value='' />
      <input type='hidden' name='confirmDeletion' value='false' />
      <input type='hidden' name='mandatoryDate' value='false' />
      <input type='hidden' name='isDetailsForm' value='false' />
    </form>
  );
};

export default ModalUpdateItem;
