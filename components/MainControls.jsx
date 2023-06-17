import { useState } from 'react';
import Link from 'next/link';

const MainControls = ({
  handleOnSubmit,
  handleEditSubmit,
  setTitle,
  title,
  setType,
  type,
  isUpdating,
  isAwaitingAddResponse,
  isAwaitingUpdateResponse,
  priority,
}) => {
  const [checkbox, setCheckbox] = useState(false);
  const [isCheckedByUser, setIsCheckedByUser] = useState(false);

  return (
    <div className='main-controls'>
      <div className='main-controls__top-controls'>
        <button
          className={`main-controls__type-button ${
            type === 'grocery' ? 'main-controls__type-button--active' : ''
          }`}
          onClick={() => {
            setType('grocery');
            setCheckbox((current) =>
              isCheckedByUser && current === true ? true : false
            );
          }}
        >
          Grocery
        </button>
        <button
          className={`main-controls__type-button ${
            type === 'big-box' ? 'main-controls__type-button--active' : ''
          }`}
          onClick={() => {
            setType('big-box');
            setCheckbox((current) =>
              isCheckedByUser && current === true ? true : false
            );
          }}
        >
          Big Box
        </button>
        <button
          className={`main-controls__type-button ${
            type === 'other' ? 'main-controls__type-button--active' : ''
          }`}
          onClick={() => {
            setType('other');
            setCheckbox((current) =>
              isCheckedByUser && current === true ? true : false
            );
          }}
        >
          Other
        </button>
        <button
          className={`main-controls__type-button ${
            type === 'upcoming' ? 'main-controls__type-button--active' : ''
          }`}
          onClick={() => {
            setType('upcoming');
            setCheckbox(true);
          }}
        >
          Upcoming
        </button>
        <label
          className='main-controls__checkbox-container'
          htmlFor='checkbox'
          style={type === 'upcoming' && checkbox ? { cursor: 'no-drop' } : {}}
          onChange={() => setIsCheckedByUser((current) => !current)}
        >
          Details
          <input
            type='checkbox'
            id='checkbox'
            onChange={(e) => {
              if (type === 'upcoming') return;
              setCheckbox(e.target.checked);
            }}
            checked={checkbox ? true : false}
          />
          <span className='main-controls__checkmark'></span>
        </label>
      </div>
      <div className='main-controls__bottom-controls'>
        <input
          type='text'
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={checkbox ? true : false}
        />
        {checkbox ? (
          <Link
            href={{
              pathname: '/details',
              query: { itemPriority: priority, type: type },
            }}
          >
            <span className='main-controls__create-button'>Create</span>
          </Link>
        ) : isUpdating ? (
          <button
            onClick={handleEditSubmit}
            className='main-controls__update-button'
          >
            {isAwaitingUpdateResponse && <div className='loader'></div>}
            Update
          </button>
        ) : (
          <button
            onClick={handleOnSubmit}
            className='main-controls__add-button'
          >
            {isAwaitingAddResponse && <div className='loader'></div>}
            Add
          </button>
        )}
      </div>
    </div>
  );
};

export default MainControls;
