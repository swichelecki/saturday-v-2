import { useState, useEffect } from 'react';
import { useAppContext } from 'context';
import { SettingsItem, Modal } from 'components';
import { deleteReminder, getReminder } from '../services';
import {
  MODAL_CREATE_REMINDER_HEADLINE,
  MODAL_UPDATE_REMINDER_HEADLINE,
  MODAL_TYPE_REMINDER,
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
  const [modalCreateReminder, setModalCreateReminder] = useState(false);
  const [modalUpdateReminder, setModalUpdateReminder] = useState(false);
  const [
    listItemIsAwaitingUpdateResponse,
    setListItemIsAwaitingUpdateResponse,
  ] = useState(false);

  // control modal
  useEffect(() => {
    if (modalCreateReminder || modalUpdateReminder) {
      setShowModal(
        <Modal
          userId={userId}
          items={remindersItems}
          setItems={setRemindersItems}
          itemToUpdate={reminderToUpdate}
          itemToEditId={reminderToEditId}
          setOpenCloseModal={
            modalCreateReminder
              ? setModalCreateReminder
              : setModalUpdateReminder
          }
          modalType={MODAL_TYPE_REMINDER}
          modalOperation={
            modalCreateReminder
              ? MODAL_OPERATION_CREATE
              : MODAL_OPERATION_UPDATE
          }
          headlineText={
            modalCreateReminder
              ? MODAL_CREATE_REMINDER_HEADLINE
              : MODAL_UPDATE_REMINDER_HEADLINE
          }
        />
      );
    }
  }, [modalCreateReminder, modalUpdateReminder]);

  // get reminder to update
  const handleReminderToUpdate = (id) => {
    setListItemIsAwaitingUpdateResponse(true);
    setReminderToEditId(id);
    getReminder(id).then((res) => {
      if (res.status === 200) {
        setReminderToUpdate(res.item);
        setModalUpdateReminder(true);
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
              setModalCreateReminder(true);
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
