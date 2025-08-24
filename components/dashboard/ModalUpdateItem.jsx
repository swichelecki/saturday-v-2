'use client';

import { useState } from 'react';
import { updateItem } from '../../actions';
import { useAppContext } from '../../context';
import { useInnerWidth, useListItemsMobileReset } from '../../hooks';
import { FormTextField, Toast, CTA } from '../../components';
import { itemSchema } from '../../schemas/schemas';
import { handleModalResetPageScrolling } from '../../utilities';
import { MOBILE_BREAKPOINT } from '../../constants';

const ModalUpdateItem = ({
  itemToUpdate,
  items,
  setItems,
  totalNumberOfItems,
}) => {
  const { setShowModal, setShowToast } = useAppContext();

  const width = useInnerWidth();
  const handleListItemsMobileReset = useListItemsMobileReset();

  const [form, setForm] = useState({
    _id: itemToUpdate?._id,
    userId: itemToUpdate?.userId,
    categoryId: itemToUpdate?.categoryId,
    title: itemToUpdate?.title,
    column: itemToUpdate?.column,
    priority: itemToUpdate?.priority,
    type: itemToUpdate?.type,
    description: itemToUpdate?.description,
    date: '',
    dateAndTime: '',
    mandatoryDate: itemToUpdate?.mandatoryDate,
    confirmDeletion: itemToUpdate?.confirmDeletion,
    itemLimit: totalNumberOfItems - 1,
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [isAwaitingSubmitResponse, setIsAwaitingSubmitResponse] =
    useState(false);

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

    const zodValidationResults = itemSchema.safeParse({
      ...form,
      isDetailsForm: false,
    });
    const { data: zodFormData, success, error } = zodValidationResults;
    if (!success) {
      const { title } = error.flatten().fieldErrors;

      if (!title) {
        const serverError = {
          status: 400,
          error: 'Zod validation failed. Check console.',
        };
        setShowToast(<Toast serverError={serverError} />);
        console.error(error);
        return;
      }

      setErrorMessage(title?.[0]);
      return;
    }

    setIsAwaitingSubmitResponse(true);
    updateItem(zodFormData).then((res) => {
      if (res.status === 200) {
        setItems(
          items.map((item) => {
            if (Object.keys(item)[0] === res.item.type) {
              return {
                [Object.keys(item)[0]]: Object.values(item)[0].map((item) => {
                  if (item._id === itemToUpdate?._id) {
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
    handleModalResetPageScrolling();
    setForm({
      _id: '',
      userId: itemToUpdate?.userId,
      categoryId: '',
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
    <>
      <h2>Update Item</h2>
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
          <CTA
            text='Cancel'
            className='cta-button cta-button--medium cta-button--full cta-button--orange'
            ariaLabel='Close modal'
            handleClick={handleCloseModal}
          />
          <CTA
            text='Update'
            btnType='submit'
            className='cta-button cta-button--medium cta-button--full cta-button--blue'
            ariaLabel='Update dashboard item'
            showSpinner={isAwaitingSubmitResponse}
          />
        </div>
      </form>
    </>
  );
};

export default ModalUpdateItem;
