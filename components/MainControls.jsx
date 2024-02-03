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
  setListItem,
  type,
  column,
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
            type === 'Grocery' ? ' main-controls__type-button--active' : ''
          }`}
          onClick={() => {
            setListItem((curr) => ({ ...curr, type: 'Grocery', column: 1 }));
            setCheckbox((current) =>
              isCheckedByUser && current === true ? true : false
            );
          }}
        >
          {width > MOBILE_BREAKPOINT ? 'Grocery' : <FaShoppingCart />}
        </button>
        <button
          className={`main-controls__type-button${
            type === 'Big Box' ? ' main-controls__type-button--active' : ''
          }`}
          onClick={() => {
            setListItem((curr) => ({ ...curr, type: 'Big Box', column: 2 }));
            setCheckbox((current) =>
              isCheckedByUser && current === true ? true : false
            );
          }}
        >
          {width > MOBILE_BREAKPOINT ? 'Big Box' : <FaStore />}
        </button>
        <button
          className={`main-controls__type-button${
            type === 'Other' ? ' main-controls__type-button--active' : ''
          }`}
          onClick={() => {
            setListItem((curr) => ({ ...curr, type: 'Other', column: 3 }));
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
            setListItem((curr) => ({
              ...curr,
              type: TYPE_UPCOMING,
              column: 4,
            }));
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
              query: { priority, type, column },
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
