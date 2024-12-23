'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useInnerWidth } from '../../hooks';
import { MdEdit } from 'react-icons/md';
import { RiDeleteBin7Fill } from 'react-icons/ri';
import { TiCancel } from 'react-icons/ti';
import { FaArrowDown, FaArrowUp } from 'react-icons/fa';
import { MOBILE_BREAKPOINT } from '../../constants';

const ItemButtons = ({
  date,
  dateAndTime,
  description,
  confirmDeletion,
  handleShowDetails,
  isOpen,
  itemToUpdateId,
  getItemToUpdate,
  itemId,
  isAwaitingEditResponse,
  handleDeleteItem,
  setIsOpen,
  isAwaitingDeleteResponse,
}) => {
  const width = useInnerWidth();

  const [idToDelete, setIdToDelete] = useState('');

  const handleDetailsButtonClass = () => {
    return width <= MOBILE_BREAKPOINT
      ? 'list-item__details-button--mobile'
      : 'list-item__details-button--desktop';
  };

  const handleEditButtonClass = () => {
    return width <= MOBILE_BREAKPOINT
      ? 'list-item__edit-button--mobile'
      : 'list-item__edit-button--desktop';
  };

  const handleCancelButtonClass = () => {
    return width <= MOBILE_BREAKPOINT
      ? 'list-item__cancel-button--mobile'
      : 'list-item__cancel-button--desktop';
  };

  const handleDeleteButtonClass = () => {
    return width <= MOBILE_BREAKPOINT
      ? 'list-item__delete-button--mobile'
      : 'list-item__delete-button--desktop';
  };

  return (
    <>
      {(date || dateAndTime) && description ? (
        <button
          onClick={handleShowDetails}
          className={`list-item__details-button ${handleDetailsButtonClass()}`}
        >
          {isOpen ? <FaArrowUp /> : <FaArrowDown />}
        </button>
      ) : !date && !dateAndTime && description ? (
        <button
          onClick={handleShowDetails}
          className={`list-item__details-button ${handleDetailsButtonClass()}`}
        >
          {isOpen ? <FaArrowUp /> : <FaArrowDown />}
        </button>
      ) : (date || dateAndTime) && !description ? (
        <Link
          href={`/details/${itemId}`}
          className={`list-item__edit-button ${handleEditButtonClass()}`}
        >
          <MdEdit />
        </Link>
      ) : itemToUpdateId !== itemId || isAwaitingEditResponse ? (
        <button
          onClick={() => {
            getItemToUpdate(itemId);
          }}
          className={`list-item__edit-button ${handleEditButtonClass()}`}
        >
          {isAwaitingEditResponse && itemToUpdateId === itemId ? (
            <div className='loader'></div>
          ) : (
            <MdEdit />
          )}
        </button>
      ) : (
        <button
          className={`list-item__cancel-button ${handleCancelButtonClass()}`}
        >
          <TiCancel />
        </button>
      )}

      <button
        onClick={() => {
          handleDeleteItem(itemId, confirmDeletion);
          setIdToDelete(itemId);
          setIsOpen(false);
        }}
        className={`list-item__delete-button ${handleDeleteButtonClass()}`}
      >
        {isAwaitingDeleteResponse && idToDelete === itemId ? (
          <div className='loader'></div>
        ) : (
          <RiDeleteBin7Fill />
        )}
      </button>
    </>
  );
};

export default ItemButtons;
