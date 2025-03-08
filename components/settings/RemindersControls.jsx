'use client';

import { useState, useEffect } from 'react';
import { useAppContext } from '../../context';
import {
  ListItem,
  Modal,
  ModalReminders,
  ModalConfirm,
  FormErrorMessage,
  Toast,
} from '../../components';
import { deleteReminder, getReminder } from '../../actions';
import { handleModalResetPageScrolling } from '../../utilities';
import {
  MODAL_CREATE_REMINDER_HEADLINE,
  MODAL_UPDATE_REMINDER_HEADLINE,
  MODAL_CONFIRM_DELETION_HEADLINE,
  MODAL_CONFIRM_COMPLETE_BUTTON,
  REMINDERS_ITEM_LIMIT,
  ITEM_TYPE_REMINDER,
} from '../../constants';

const RemindersControls = ({ reminders, userId }) => {
  const { setShowToast, setShowModal, isRemindersPrompt, prompt } =
    useAppContext();

  const [remindersItems, setRemindersItems] = useState(reminders ?? []);
  const [reminderToEditId, setReminderToEditId] = useState('');
  const [
    listItemIsAwaitingUpdateResponse,
    setListItemIsAwaitingUpdateResponse,
  ] = useState(false);
  const [atRemindersLimit, setAtRemindersLimit] = useState(false);

  // remove at-reminders-limit message after reminder deletion
  useEffect(() => {
    if (remindersItems?.length < REMINDERS_ITEM_LIMIT && atRemindersLimit) {
      setAtRemindersLimit(false);
    }
  }, [remindersItems]);

  // open modal for create
  const handleOpenReminderModal = () => {
    if (remindersItems?.length >= REMINDERS_ITEM_LIMIT) {
      setAtRemindersLimit(true);
    }

    setShowModal(
      <Modal className='modal modal__form-modal--large'>
        <h2>{MODAL_CREATE_REMINDER_HEADLINE}</h2>
        <ModalReminders
          userId={userId}
          items={remindersItems}
          setItems={setRemindersItems}
          itemToEditId={reminderToEditId}
          numberOfReminders={remindersItems?.length}
        />
      </Modal>
    );
  };

  // get reminder to update
  const getItemToUpdate = (id) => {
    setListItemIsAwaitingUpdateResponse(true);
    setReminderToEditId(id);
    getReminder(userId, id).then((res) => {
      if (res.status === 200) {
        setShowModal(
          <Modal className='modal modal__form-modal--large'>
            <h2>{MODAL_UPDATE_REMINDER_HEADLINE}</h2>
            <ModalReminders
              userId={userId}
              items={remindersItems}
              setItems={setRemindersItems}
              itemToUpdate={res.item}
              numberOfReminders={remindersItems?.length}
            />
          </Modal>
        );
      }

      if (res.status !== 200) {
        setShowToast(<Toast serverError={res} />);
      }
      setListItemIsAwaitingUpdateResponse(false);
    });
  };

  // delete reminder
  const handleDeleteReminder = (id, confirmDeletion) => {
    if (confirmDeletion) {
      setShowModal(
        <Modal showCloseButton={false}>
          <h2>{MODAL_CONFIRM_DELETION_HEADLINE}</h2>
          <ModalConfirm
            handleConfirm={handleDeleteReminder}
            confirmId={id}
            confirmBtnText={MODAL_CONFIRM_COMPLETE_BUTTON}
          />
        </Modal>
      );
      return;
    }

    deleteReminder(userId, id).then((res) => {
      if (res.status === 200) {
        setRemindersItems(remindersItems.filter((item) => item._id !== id));
      }

      if (res.status !== 200) {
        setShowToast(<Toast serverError={res} />);
      }

      setShowModal(null);
      handleModalResetPageScrolling();
    });
  };

  return (
    <>
      <div className='form-page__list-items-heading-wrapper'>
        <h1 className='form-page__h2'>Recurring Reminders</h1>
      </div>
      <div className='settings-controls'>
        {isRemindersPrompt && prompt}
        <div className='settings-controls__button-wrapper'>
          <button
            onClick={handleOpenReminderModal}
            type='button'
            className='form-page__save-button'
          >
            Create
          </button>
          {atRemindersLimit && (
            <FormErrorMessage
              errorMessage={`Limit ${REMINDERS_ITEM_LIMIT} reminders!`}
              className='form-error-message form-error-message--position-static'
            />
          )}
          <p>
            Create reminders for birthdays, anniversaries, bills, car
            maintenance and the like here. If it is a recurring event or
            obligation which you don’t want to forget, put it here.
          </p>
        </div>
        <div className='settings-controls__list-wrapper'>
          {remindersItems?.map((item, index) => (
            <ListItem
              key={`reminder-item_${index}`}
              item={item}
              index={index}
              handleDeleteItem={handleDeleteReminder}
              getItemToUpdate={getItemToUpdate}
              isAwaitingEditResponse={listItemIsAwaitingUpdateResponse}
              itemToUpdateId={reminderToEditId}
              itemType={ITEM_TYPE_REMINDER}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default RemindersControls;
