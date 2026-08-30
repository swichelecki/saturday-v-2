export const handleSortCalendarItemsAsc = (unsortedCalendarItems) => {
  if (!unsortedCalendarItems || !unsortedCalendarItems.length) return [];

  const sortedCalendarItems = [];
  const itemsWithDateAndTime = [];

  for (const item of unsortedCalendarItems) {
    if (item.date !== null && !item.dateAndTime) {
      sortedCalendarItems.push(item);
    }

    if (item.dateAndTime) {
      itemsWithDateAndTime.push({
        ...item,
        dateAndTime: new Date(item.dateAndTime),
      });
    }
  }

  const itemsWithDateAndTimeSortedAsc = itemsWithDateAndTime.sort(
    (objA, objB) => Number(objA['dateAndTime']) - Number(objB['dateAndTime']),
  );

  itemsWithDateAndTimeSortedAsc.map((item) => ({
    ...item,
    dateAndTime: item.dateAndTime.toISOString(),
  }));

  return [...sortedCalendarItems, ...itemsWithDateAndTimeSortedAsc];
};
