'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useInnerWidth } from '../../hooks';
import { MdEdit } from 'react-icons/md';
import { RiDeleteBin7Fill } from 'react-icons/ri';
import { FaArrowDown, FaArrowUp } from 'react-icons/fa';
import { MOBILE_BREAKPOINT } from '../../constants';

const ItemButtons = ({
  date,
  dateAndTime,
  description,
  confirmDeletion,
  setIsOpen,
  isOpen,
  itemToUpdateId,
  getItemToUpdate,
  itemId,
  isAwaitingEditResponse,
  handleDeleteItem,
  isAwaitingDeleteResponse,
  mobileDeleteButtonRef,
  mobileUpdateOrDetailsButtonRef,
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

  const handleDeleteButtonClass = () => {
    return width <= MOBILE_BREAKPOINT
      ? 'list-item__delete-button--mobile'
      : 'list-item__delete-button--desktop';
  };

  return (
    <>
      {description ? (
        <button
          onClick={() => {
            setIsOpen((curr) => !curr);
          }}
          className={`list-item__details-button ${handleDetailsButtonClass()}`}
          ref={mobileUpdateOrDetailsButtonRef}
        >
          {isOpen ? <FaArrowUp /> : <FaArrowDown />}
        </button>
      ) : (date || dateAndTime) && !description ? (
        <Link
          href={`/details/${itemId}`}
          className={`list-item__edit-button ${handleEditButtonClass()}`}
          ref={mobileUpdateOrDetailsButtonRef}
        >
          <MdEdit />
        </Link>
      ) : (
        <button
          onClick={() => {
            getItemToUpdate(itemId);
          }}
          className={`list-item__edit-button ${handleEditButtonClass()}`}
          ref={mobileUpdateOrDetailsButtonRef}
        >
          {isAwaitingEditResponse && itemToUpdateId === itemId ? (
            <div className='loader'></div>
          ) : (
            <MdEdit />
          )}
        </button>
      )}
      <button
        onClick={() => {
          handleDeleteItem(itemId, confirmDeletion);
          setIdToDelete(itemId);
        }}
        className={`list-item__delete-button ${handleDeleteButtonClass()}`}
        ref={mobileDeleteButtonRef}
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
