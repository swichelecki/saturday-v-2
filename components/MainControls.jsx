import { useState } from 'react';
import Link from 'next/link';
import { useInnerWidth } from '../hooks';
import { Checkbox } from 'components';
import {
  FaShoppingCart,
  FaStore,
  FaCogs,
  FaCalendarCheck,
} from 'react-icons/fa';
import { MOBILE_BREAKPOINT, TYPE_UPCOMING } from 'constants';

const MainControls = ({
  handleOnSubmit,
  handleEditSubmit,
  title,
  handleSetListItem,
  setType,
  type,
  isUpdating,
  isAwaitingAddResponse,
  isAwaitingUpdateResponse,
  priority,
}) => {
  const width = useInnerWidth();

  const [checkbox, setCheckbox] = useState(false);
  const [isCheckedByUser, setIsCheckedByUser] = useState(false);

  const handleSetCheckbox = (e) => {
    setCheckbox(e.target.checked);
    setIsCheckedByUser((current) => !current);
  };

  return (
    <div className='main-controls'>
      <div className='main-controls__top-controls'>
        <button
          className={`main-controls__type-button${
            type === 'grocery' ? ' main-controls__type-button--active' : ''
          }`}
          onClick={() => {
            setType('grocery');
            setCheckbox((current) =>
              isCheckedByUser && current === true ? true : false
            );
          }}
        >
          {width > MOBILE_BREAKPOINT ? 'Grocery' : <FaShoppingCart />}
        </button>
        <button
          className={`main-controls__type-button${
            type === 'big-box' ? ' main-controls__type-button--active' : ''
          }`}
          onClick={() => {
            setType('big-box');
            setCheckbox((current) =>
              isCheckedByUser && current === true ? true : false
            );
          }}
        >
          {width > MOBILE_BREAKPOINT ? 'Big Box' : <FaStore />}
        </button>
        <button
          className={`main-controls__type-button${
            type === 'other' ? ' main-controls__type-button--active' : ''
          }`}
          onClick={() => {
            setType('other');
            setCheckbox((current) =>
              isCheckedByUser && current === true ? true : false
            );
          }}
        >
          {width > MOBILE_BREAKPOINT ? 'Other' : <FaCogs />}
        </button>
        <button
          className={`main-controls__type-button${
            type === TYPE_UPCOMING ? ' main-controls__type-button--active' : ''
          }`}
          onClick={() => {
            setType(TYPE_UPCOMING);
            setCheckbox(true);
          }}
        >
          {width > MOBILE_BREAKPOINT ? 'Upcoming' : <FaCalendarCheck />}
        </button>
        <Checkbox
          label={'Detailed'}
          type={type}
          checked={checkbox}
          onChangeHandler={
            type !== TYPE_UPCOMING ? handleSetCheckbox : () => {}
          }
        />
      </div>
      <div className='main-controls__bottom-controls'>
        {checkbox && !isUpdating ? (
          <Link
            href={{
              pathname: '/details',
              query: { priority, type },
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
        <input
          type='text'
          value={title}
          onChange={handleSetListItem}
          disabled={checkbox && !isUpdating}
        />
      </div>
    </div>
  );
};

export default MainControls;
