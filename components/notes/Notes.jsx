'use client';

import { useState, useEffect } from 'react';
import { useAppContext } from '../../context';
import { deleteNote, getNote } from '../../actions';
import {
  NoteGroup,
  Modal,
  ModalNotes,
  ModalDelete,
  FormErrorMessage,
  Toast,
} from '../../components';
import {
  MODAL_CREATE_NOTE_HEADLINE,
  MODAL_UPDATE_NOTE_HEADLINE,
  NOTES_ITEM_LIMIT,
  MODAL_CONFIRM_DELETION_HEADLINE,
  MOBILE_BREAKPOINT,
} from '../../constants';

const Notes = ({ notes, user }) => {
  const { userId, admin } = user;
  const { setUserId, setIsAdmin, setShowModal, setShowToast } = useAppContext();

  const [noteItemsGrouped, setNoteItemsGrouped] = useState(notes);
  const [atNotesLimit, setAtNotesLimit] = useState(false);
  const [itemToUpdateId, setItemToUpdateId] = useState('');
  const [isAwaitingUpdateResponse, setIsAwaitingUpdateResponse] =
    useState(false);

  useEffect(() => {
    // set global context user id and admin status
    setUserId(userId);
    setIsAdmin(admin);
  }, []);

  // open modal for create
  const handleOpenNoteModal = () => {
    if (noteItemsGrouped?.length >= NOTES_ITEM_LIMIT) {
      setAtNotesLimit(true);
      return;
    }

    setShowModal(
      <Modal className='modal modal__form-modal--small'>
        <h2>{MODAL_CREATE_NOTE_HEADLINE}</h2>
        <ModalNotes
          userId={userId}
          items={noteItemsGrouped}
          setItems={setNoteItemsGrouped}
          numberOfItems={noteItemsGrouped?.length}
        />
      </Modal>
    );
  };

  // open modal for update
  const getItemToUpdate = (id) => {
    setIsAwaitingUpdateResponse(true);
    setItemToUpdateId(id);
    getNote(id, userId).then((res) => {
      if (res.status === 200) {
        setShowModal(
          <Modal className='modal modal__form-modal--small'>
            <h2>{MODAL_UPDATE_NOTE_HEADLINE}</h2>
            <ModalNotes
              userId={userId}
              items={noteItemsGrouped}
              setItems={setNoteItemsGrouped}
              itemToUpdate={res.item}
              itemToEditId={res.item._id}
              numberOfItems={noteItemsGrouped?.length}
            />
          </Modal>
        );
      }

      if (res.status !== 200) {
        setShowToast(<Toast serverError={res} />);
      }

      setIsAwaitingUpdateResponse(false);
    });
  };

  // handle delete note
  const handleDeleteNote = (id, confirmDeletion) => {
    if (confirmDeletion) {
      setShowModal(
        <Modal showCloseButton={false}>
          <h2>{MODAL_CONFIRM_DELETION_HEADLINE}</h2>
          <ModalDelete
            handleDeleteItem={handleDeleteNote}
            modalIdToDelete={id}
          />
        </Modal>
      );
      return;
    }

    deleteNote(id, userId).then((res) => {
      if (res.status === 200) {
        setNoteItemsGrouped(
          noteItemsGrouped.map((item) => {
            if (Object.keys(item)[0] === res.item.type) {
              return {
                [Object.keys(item)[0]]: Object.values(item)[0].filter(
                  (item) => item._id !== res.item._id
                ),
              };
            } else {
              return item;
            }
          })
        );
      }

      // TODO: put function into utility
      //if (width <= MOBILE_BREAKPOINT) handleItemsTouchReset();

      if (res.status !== 200) {
        setShowToast(<Toast serverError={res} />);
      }

      setShowModal(null);
    });
  };

  return (
    <div className='form-page form-page__list-items'>
      <div className='form-page__list-items-controls-wrapper'>
        <h2 className='form-page__h2'>Notes</h2>
        <button
          onClick={handleOpenNoteModal}
          type='button'
          className='form-page__save-button'
        >
          Create
        </button>
      </div>
      {atNotesLimit && (
        <FormErrorMessage
          errorMessage={`Limit ${NOTES_ITEM_LIMIT} Notes!`}
          className='form-error-message form-error-message--position-static'
        />
      )}
      {noteItemsGrouped?.map((item, index) => (
        <NoteGroup
          key={`note-group_${index}`}
          heading={Object.keys(item)[0]}
          items={Object.values(item)[0]}
          handleDeleteItem={handleDeleteNote}
          getItemToUpdate={getItemToUpdate}
          itemToUpdateId={itemToUpdateId}
          isAwaitingEditResponse={isAwaitingUpdateResponse}
        />
      ))}
    </div>
  );
};

export default Notes;
