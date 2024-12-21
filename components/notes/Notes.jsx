'use client';

import { useState, useEffect } from 'react';
import { useAppContext } from '../../context';
import { Modal, ModalNotes, FormErrorMessage } from '../../components';
import { MODAL_CREATE_NOTE_HEADLINE, NOTES_ITEM_LIMIT } from '../../constants';

const Notes = ({ notes, user }) => {
  console.log('NOTES ', notes);
  const { userId, admin } = user;
  const { setUserId, setIsAdmin, setShowModal } = useAppContext();

  const [notesItems, setNotesItems] = useState(notes);
  const [noteToUpdate, setNoteToUpdate] = useState({});
  const [atNotesLimit, setAtNotesLimit] = useState(false);

  useEffect(() => {
    // set global context user id and admin status
    setUserId(userId);
    setIsAdmin(admin);
  }, []);

  const handleOpenNoteModal = () => {
    if (notesItems?.length >= NOTES_ITEM_LIMIT) {
      setAtNotesLimit(true);
      return;
    }

    setShowModal(
      <Modal className='modal modal__form-modal--small'>
        <h2>{MODAL_CREATE_NOTE_HEADLINE}</h2>
        <ModalNotes
          userId={userId}
          note={noteToUpdate}
          numberOfItems={notesItems?.length}
        />
      </Modal>
    );
  };

  return (
    <div className='form-page'>
      <h2 className='form-page__h2'>Notes</h2>
      <button
        onClick={handleOpenNoteModal}
        type='button'
        className='form-page__save-button'
      >
        Create
      </button>
      {atNotesLimit && (
        <FormErrorMessage
          errorMessage={`Limit ${NOTES_ITEM_LIMIT} Notes!`}
          className='form-error-message form-error-message--position-static'
        />
      )}
    </div>
  );
};

export default Notes;
