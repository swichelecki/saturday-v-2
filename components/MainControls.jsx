import { useState } from 'react';
import Link from 'next/link';
//import { useInnerWidth } from '../hooks';
import { Checkbox } from 'components';
//import { MOBILE_BREAKPOINT } from 'constants';

const MainControls = ({
  categories,
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
  //const width = useInnerWidth();

  const [checkbox, setCheckbox] = useState(false);
  const [isCheckedByUser, setIsCheckedByUser] = useState(false);
  const [hasMandatoryDate, setHasMandatoryDate] = useState('');

  const handleSetCheckbox = (e) => {
    setCheckbox(e.target.checked);
    setIsCheckedByUser((current) => !current);
  };

  return (
    <div className='main-controls'>
      <div className='main-controls__top-controls'>
        {categories?.map((item, index) => (
          <button
            key={`category-button_${index}`}
            className={`main-controls__type-button${
              type === item?.type ? ' main-controls__type-button--active' : ''
            }`}
            onClick={() => {
              setListItem((curr) => ({
                ...curr,
                type: item?.type,
                column: index + 1,
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
        <Checkbox
          label={'Detailed'}
          type={type}
          checked={checkbox}
          onChangeHandler={
            !Boolean(hasMandatoryDate) ? handleSetCheckbox : () => {}
          }
        />
      </div>
      <div className='main-controls__bottom-controls'>
        {checkbox && !isUpdating ? (
          <Link
            href={{
              pathname: '/details',
              query: { priority, type, column, hasMandatoryDate },
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
