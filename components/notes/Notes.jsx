'use client';

import { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../../context';
import {
  useInnerWidth,
  useCloseListItemsYAxis,
  useListItemsMobileReset,
  usePrompt,
} from '../../hooks';
import { deleteNote, getNote, pinNote } from '../../actions';
import {
  NoteGroup,
  Modal,
  ModalNotes,
  ModalConfirm,
  FormErrorMessage,
  Toast,
  SearchField,
} from '../../components';
import { handleModalResetPageScrolling } from '../../utilities';
import {
  MODAL_CREATE_NOTE_HEADLINE,
  MODAL_UPDATE_NOTE_HEADLINE,
  NOTES_ITEM_LIMIT,
  MODAL_CONFIRM_DELETION_HEADLINE,
  MOBILE_BREAKPOINT,
  MODAL_CONFIRM_DELETE_BUTTON,
} from '../../constants';

const Notes = ({ notes, user, notesCount }) => {
  const closeButtonRef = useRef(null);

  const { userId, admin, newNotesUser } = user;
  const {
    setUserId,
    setIsAdmin,
    setShowModal,
    setShowToast,
    prompt,
    isNotesPrompt,
    setIsNotesPrompt,
  } = useAppContext();

  const width = useInnerWidth();
  const handleListItemsMobileReset = useListItemsMobileReset();
  const handleCloseListItemsYAxis = useCloseListItemsYAxis();
  usePrompt(userId, newNotesUser);

  const [noteItemsGrouped, setNoteItemsGrouped] = useState(notes);
  const [currentNoteCount, setCurrentNoteCount] = useState(notesCount);
  const [filteredItems, setFilteredItems] = useState([]);
  const [atNotesLimit, setAtNotesLimit] = useState(false);
  const [itemToUpdateId, setItemToUpdateId] = useState('');
  const [isAwaitingUpdateResponse, setIsAwaitingUpdateResponse] =
    useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // remove at-notes-limit message after note deletion
  useEffect(() => {
    if (currentNoteCount < NOTES_ITEM_LIMIT && atNotesLimit) {
      setAtNotesLimit(false);
    }
  }, [atNotesLimit, currentNoteCount]);

  useEffect(() => {
    // set global context
    setUserId(userId);
    setIsAdmin(admin);
    if (newNotesUser) setIsNotesPrompt(true);
  }, []);

  // clear searched items state on create, update or delete
  const handleClearSearch = () => {
    closeButtonRef.current.click();
  };

  // open modal for create
  const handleOpenNoteModal = () => {
    if (currentNoteCount >= NOTES_ITEM_LIMIT) {
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
          numberOfItems={currentNoteCount}
          isSearching={isSearching}
          handleClearSearch={handleClearSearch}
          setCurrentNoteCount={setCurrentNoteCount}
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
              isSearching={isSearching}
              handleClearSearch={handleClearSearch}
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
          <ModalConfirm
            handleConfirm={handleDeleteNote}
            confirmId={id}
            confirmBtnText={MODAL_CONFIRM_DELETE_BUTTON}
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

        if (width <= MOBILE_BREAKPOINT) handleListItemsMobileReset();
        setCurrentNoteCount((curr) => curr - 1);
      }

      if (res.status !== 200) {
        setShowToast(<Toast serverError={res} />);
      }

      setShowModal(null);
      handleModalResetPageScrolling();
      isSearching ? handleClearSearch() : handleCloseListItemsYAxis();
    });
  };

  // handle pin note
  const handlePinNote = (id, userId, pinnedStatus, date) => {
    const year = date?.split('T')[0].split('-')[0];
    pinNote(id, userId, pinnedStatus, year).then((res) => {
      if (res.status === 200) {
        setNoteItemsGrouped(
          noteItemsGrouped.map((item) => {
            if (Object.keys(item)[0] === res.item.type) {
              return {
                [Object.keys(item)[0]]: [
                  res.item,
                  ...Object.values(item)[0],
                ].sort((a, b) => a?.date + b?.date),
              };
            } else {
              return {
                [Object.keys(item)[0]]: Object.values(item)[0].filter(
                  (item) => item._id !== res.item._id
                ),
              };
            }
          })
        );
      }

      if (res.status !== 200) {
        setShowToast(<Toast serverError={res} />);
      }
    });
  };

  return (
    <div className='form-page form-page__list-items'>
      <div className='form-page__list-items-heading-wrapper'>
        <h1 className='form-page__h2'>Notes</h1>
      </div>
      <div className='form-page__list-items-controls-wrapper'>
        {isNotesPrompt && prompt}
        <button
          onClick={handleOpenNoteModal}
          type='button'
          className='form-page__save-button'
        >
          Create
        </button>
        <SearchField
          searchItems={noteItemsGrouped}
          setSearchItems={setFilteredItems}
          isSearching={isSearching}
          setIsSearching={setIsSearching}
          closeButtonRef={closeButtonRef}
        />
      </div>
      {atNotesLimit && (
        <FormErrorMessage
          errorMessage={`Limit ${NOTES_ITEM_LIMIT} Notes!`}
          className='form-error-message form-error-message--position-static'
        />
      )}
      {(isSearching ? filteredItems : noteItemsGrouped)?.map((item, index) => (
        <NoteGroup
          key={`note-group_${index}`}
          heading={Object.keys(item)[0]}
          items={Object.values(item)[0]}
          handleDeleteItem={handleDeleteNote}
          getItemToUpdate={getItemToUpdate}
          itemToUpdateId={itemToUpdateId}
          isAwaitingEditResponse={isAwaitingUpdateResponse}
          handlePinNote={handlePinNote}
        />
      ))}
    </div>
  );
};

export default Notes;
