'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Checkbox } from '..';

const MainControls = ({
  categories,
  handleOnSubmit,
  title,
  handleSetListItem,
  setListItem,
  type,
  column,
  categoryId,
  isAwaitingAddResponse,
  priority,
  userId,
}) => {
  const [checkbox, setCheckbox] = useState(false);
  const [isCheckedByUser, setIsCheckedByUser] = useState(false);
  const [hasMandatoryDate, setHasMandatoryDate] = useState('');

  // check if first category has detailed view on page load
  useEffect(() => {
    if (categories[0]?.mandatoryDate) {
      setCheckbox(true);
      setHasMandatoryDate(true);
    }
  }, []);

  const handleSetCheckbox = (e) => {
    setCheckbox(e.target.checked);
    setIsCheckedByUser((current) => !current);
  };

  return (
    <form onSubmit={handleOnSubmit} className='main-controls'>
      <div className='main-controls__top-controls'>
        <div className='main-controls__select-wrapper'>
          <select
            onChange={(e) => {
              const category = JSON.parse(e.currentTarget.value);
              setListItem((curr) => ({
                ...curr,
                type: category?.title,
                column: category?.priority,
                categoryId: category?._id,
              }));
              setCheckbox((current) =>
                (isCheckedByUser && current === true) || category?.mandatoryDate
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
                {item?.title}
              </option>
            ))}
          </select>
        </div>
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
              query: { priority, type, column, hasMandatoryDate, categoryId },
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
      <input type='hidden' name='categoryId' value={categoryId} />
      <input type='hidden' name='column' value={column} />
      <input type='hidden' name='priority' value={priority} />
      <input type='hidden' name='type' value={type} />
      <input type='hidden' name='description' value='' />
      <input type='hidden' name='date' value='' />
      <input type='hidden' name='dateAndTime' value='' />
      <input type='hidden' name='mandatoryDate' value='false' />
      <input type='hidden' name='confirmDeletion' value='false' />
      <input type='hidden' name='isDetailsForm' value='false' />
    </form>
  );
};

export default MainControls;
