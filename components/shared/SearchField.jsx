'use client';

import { useCloseListItemsYAxis } from '../../hooks';
import { useState, useEffect } from 'react';
import { IoClose } from 'react-icons/io5';

const SearchField = ({
  searchItems,
  setSearchItems,
  isSearching,
  setIsSearching,
  closeButtonRef,
}) => {
  const handleCloseListItemsYAxis = useCloseListItemsYAxis();

  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!searchQuery) return setIsSearching(false);

    setIsSearching(true);
    const copyOfSearchQuery = searchQuery;

    const handleFormat = (string) =>
      string.toLowerCase().replace(/(<([^>]+)>)/gi, '');

    const filteredItemsWithEmptyArrays = searchItems?.map((item) => {
      return {
        [Object.keys(item)[0]]: Object.values(item)[0]?.filter((item) => {
          if (
            handleFormat(item?.title).includes(
              copyOfSearchQuery.toLowerCase()
            ) ||
            handleFormat(item?.description).includes(
              copyOfSearchQuery.toLowerCase()
            )
          )
            return item;
        }),
      };
    });

    setSearchItems(
      filteredItemsWithEmptyArrays?.filter(
        (item) => Object.values(item)[0]?.length > 0
      )
    );
  }, [searchQuery]);

  const handleOnChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleClearSearch = () => {
    if (!isSearching) return;
    setSearchQuery('');
    setIsSearching(false);
    handleCloseListItemsYAxis();
  };

  return (
    <div className='search-field'>
      <input
        type='text'
        value={searchQuery}
        onChange={handleOnChange}
        placeholder='Search'
      />
      <button
        ref={closeButtonRef}
        type='button'
        onClick={handleClearSearch}
        className='search-field__clear-search-button'
      >
        <IoClose />
      </button>
    </div>
  );
};

export default SearchField;
