import { useState } from 'react';
import { useAppContext } from 'context';
import { SettingsItem, Modal, ModalReminders } from 'components';
import { deleteReminder, getReminder } from '../services';
import {
  MODAL_CREATE_REMINDER_HEADLINE,
  MODAL_UPDATE_REMINDER_HEADLINE,
  MODAL_OPERATION_CREATE,
  MODAL_OPERATION_UPDATE,
} from 'constants';

const RemindersControls = ({ reminders, userId }) => {
  const { setShowToast, setServerError, setShowModal } = useAppContext();

  const [remindersItems, setRemindersItems] = useState(reminders ?? []);
  const [isAwaitingDeleteResponse, setIsAwaitingDeleteResponse] =
    useState(false);
  const [reminderToEditId, setReminderToEditId] = useState('');
  const [reminderToUpdate, setReminderToUpdate] = useState({});
  const [
    listItemIsAwaitingUpdateResponse,
    setListItemIsAwaitingUpdateResponse,
  ] = useState(false);

  // get reminder to update
  const handleReminderToUpdate = (id) => {
    setListItemIsAwaitingUpdateResponse(true);
    setReminderToEditId(id);
    getReminder(id).then((res) => {
      if (res.status === 200) {
        setReminderToUpdate(res.item);
        setShowModal(
          <Modal className='modal__form-modal--large'>
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
        setServerError(res.status);
        setShowToast(true);
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
        setServerError(res.status);
        setShowToast(true);
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
              setShowModal(
                <Modal className='modal__form-modal--large'>
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
            }}
            className='form-page__save-button'
          >
            Create
          </button>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus
            volutpat lacus eleifend tellus cursus iaculis. Morbi bibendum sit
            amet nibh ornare convallis. Proin bibendum non eros at efficitur.
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
