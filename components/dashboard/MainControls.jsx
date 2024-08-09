'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useInnerWidth } from '../../hooks';
import { Checkbox } from '..';
import { MOBILE_BREAKPOINT } from '../../constants';

const MainControls = ({
  categories,
  handleOnSubmit,
  title,
  handleSetListItem,
  setListItem,
  type,
  column,
  isAwaitingAddResponse,
  priority,
  userId,
}) => {
  const width = useInnerWidth();

  const [checkbox, setCheckbox] = useState(false);
  const [isCheckedByUser, setIsCheckedByUser] = useState(false);
  const [hasMandatoryDate, setHasMandatoryDate] = useState('');

  const handleSetCheckbox = (e) => {
    setCheckbox(e.target.checked);
    setIsCheckedByUser((current) => !current);
  };

  return (
    <form onSubmit={handleOnSubmit} className='main-controls'>
      <div className='main-controls__top-controls'>
        {(width && width <= MOBILE_BREAKPOINT) || categories?.length > 4 ? (
          <div className='main-controls__select-wrapper'>
            <select
              onChange={(e) => {
                const category = JSON.parse(e.currentTarget.value);
                setListItem((curr) => ({
                  ...curr,
                  type: category?.type,
                  column: category?.priority,
                }));
                setCheckbox((current) =>
                  (isCheckedByUser && current === true) ||
                  category?.mandatoryDate
                    ? true
                    : false
                );
                setHasMandatoryDate(category?.mandatoryDate ? 'true' : '');
              }}
            >
              {categories?.map((item, index) => (
                <option
                  key={`category-option_${index}`}
                  value={JSON.stringify(item)}
                >
                  {item?.type}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <>
            {categories?.map((item, index) => (
              <button
                key={`category-button_${index}`}
                className={`main-controls__type-button${
                  type === item?.type
                    ? ' main-controls__type-button--active'
                    : ''
                }`}
                type='button'
                onClick={() => {
                  setListItem((curr) => ({
                    ...curr,
                    type: item?.type,
                    column: item?.priority,
                  }));
                  setCheckbox((current) =>
                    (isCheckedByUser && current === true) || item?.mandatoryDate
                      ? true
                      : false
                  );
                  setHasMandatoryDate(item?.mandatoryDate ? 'true' : '');
                }}
              >
                {item?.type}
              </button>
            ))}
          </>
        )}
        <Checkbox
          label='Detailed'
          name='mandatoryDate'
          hasMandatoryDate={hasMandatoryDate}
          checked={checkbox}
          onChangeHandler={
            !Boolean(hasMandatoryDate) ? handleSetCheckbox : () => {}
          }
        />
      </div>
      <div className='main-controls__bottom-controls'>
        {checkbox ? (
          <Link
            href={{
              pathname: '/details',
              query: { priority, type, column, hasMandatoryDate },
            }}
          >
            <span className='main-controls__create-button'>Create</span>
          </Link>
        ) : (
          <button type='submit' className='main-controls__add-button'>
            {isAwaitingAddResponse && <div className='loader'></div>}
            Add
          </button>
        )}
        <input
          type='text'
          name='title'
          value={title}
          onChange={handleSetListItem}
          disabled={checkbox}
        />
      </div>
      <input type='hidden' name='userId' value={userId} />
      <input type='hidden' name='column' value={column} />
      <input type='hidden' name='priority' value={priority} />
      <input type='hidden' name='type' value={type} />
      <input type='hidden' name='description' value='' />
      <input type='hidden' name='date' value='' />
      <input type='hidden' name='dateAndTime' value='' />
    </form>
  );
};

export default MainControls;
