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
import {
  MODAL_CREATE_REMINDER_HEADLINE,
  MODAL_UPDATE_REMINDER_HEADLINE,
  MODAL_OPERATION_CREATE,
  MODAL_OPERATION_UPDATE,
  AT_REMINDERS_LIMIT,
} from '../../constants';

const RemindersControls = ({ reminders, userId }) => {
  const { setShowToast, setShowModal } = useAppContext();

  const [remindersItems, setRemindersItems] = useState(reminders ?? []);
  const [isAwaitingDeleteResponse, setIsAwaitingDeleteResponse] =
    useState(false);
  const [reminderToEditId, setReminderToEditId] = useState('');
  const [reminderToUpdate, setReminderToUpdate] = useState({});
  const [
    listItemIsAwaitingUpdateResponse,
    setListItemIsAwaitingUpdateResponse,
  ] = useState(false);
  const [atRemindersLimit, setAtRemindersLimit] = useState(false);

  // remove at-reminders-limit message after reminder deletion
  useEffect(() => {
    if (remindersItems?.length < 25 && atRemindersLimit) {
      setAtRemindersLimit(false);
    }
  }, [remindersItems]);

  // get reminder to update
  const handleReminderToUpdate = (id) => {
    setListItemIsAwaitingUpdateResponse(true);
    setReminderToEditId(id);
    getReminder(id).then((res) => {
      if (res.status === 200) {
        setReminderToUpdate(res.item);
        setShowModal(
          <Modal className='modal modal__form-modal--large'>
            <h2>{MODAL_UPDATE_REMINDER_HEADLINE}</h2>
            <ModalReminders
              userId={userId}
              items={remindersItems}
              setItems={setRemindersItems}
              itemToUpdate={res.item}
              itemToEditId={id}
              modalOperation={MODAL_OPERATION_UPDATE}
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

    deleteReminder(id).then((res) => {
      if (res.status === 200) {
        setRemindersItems(remindersItems.filter((item) => item._id !== id));
      }

      if (res.status !== 200) {
        setShowToast(<Toast serverError={res} />);
      }

      setShowModal(null);
      setIsAwaitingDeleteResponse(false);
    });
  };

  return (
    <>
      <h2>Manage Recurring Reminders</h2>
      <div className='settings-controls'>
        <div className='settings-controls__button-wrapper'>
          <button
            onClick={() => {
              if (remindersItems?.length < 25) {
                setShowModal(
                  <Modal className='modal modal__form-modal--large'>
                    <h2>{MODAL_CREATE_REMINDER_HEADLINE}</h2>
                    <ModalReminders
                      userId={userId}
                      items={remindersItems}
                      setItems={setRemindersItems}
                      itemToUpdate={reminderToUpdate}
                      itemToEditId={reminderToEditId}
                      modalOperation={MODAL_OPERATION_CREATE}
                    />
                  </Modal>
                );
              } else {
                setAtRemindersLimit(true);
              }
            }}
            className='form-page__save-button'
          >
            Create
          </button>
          {atRemindersLimit && (
            <FormErrorMessage
              errorMessage={AT_REMINDERS_LIMIT}
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
