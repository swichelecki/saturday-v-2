'use client';

import { useState, useEffect } from 'react';
import { useAppContext } from '../../context';
import {
  SettingsItem,
  Modal,
  ModalReminders,
  FormErrorMessage,
  Toast,
} from '../../components';
import { deleteReminder, getReminder } from '../../actions';
import { handleModalResetPageScrolling } from '../../utilities';
import {
  MODAL_CREATE_REMINDER_HEADLINE,
  MODAL_UPDATE_REMINDER_HEADLINE,
  REMINDERS_ITEM_LIMIT,
} from '../../constants';

const RemindersControls = ({ reminders, userId }) => {
  const { setShowToast, setShowModal, isRemindersPrompt, prompt } =
    useAppContext();

  const [remindersItems, setRemindersItems] = useState(reminders ?? []);
  const [isAwaitingDeleteResponse, setIsAwaitingDeleteResponse] =
    useState(false);
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

  // get reminder to update
  const handleReminderToUpdate = (id) => {
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
              itemToEditId={id}
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
  const handleDeleteReminder = (id) => {
    setIsAwaitingDeleteResponse(true);

    deleteReminder(userId, id).then((res) => {
      if (res.status === 200) {
        setRemindersItems(remindersItems.filter((item) => item._id !== id));
      }

      if (res.status !== 200) {
        setShowToast(<Toast serverError={res} />);
      }

      setShowModal(null);
      handleModalResetPageScrolling();
      setIsAwaitingDeleteResponse(false);
    });
  };

  return (
    <>
      <h1 className='form-page__h2'>Reminders</h1>
      <div className='settings-controls'>
        {isRemindersPrompt && prompt}
        <div className='settings-controls__button-wrapper'>
          <button
            onClick={() => {
              if (remindersItems?.length < REMINDERS_ITEM_LIMIT) {
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
              } else {
                setAtRemindersLimit(true);
              }
            }}
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
            <SettingsItem
              key={`reminder-item_${index}`}
              item={item}
              index={index}
              handleDeleteItem={handleDeleteReminder}
              isAwaitingDeleteResponse={isAwaitingDeleteResponse}
              handleUpdateItem={handleReminderToUpdate}
              isAwaitingEditResponse={listItemIsAwaitingUpdateResponse}
              reminderToEditId={reminderToEditId}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default RemindersControls;
