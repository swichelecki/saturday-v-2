const handleSortItemsAscending = (filteredUpcomingTasks) => {
  const tasksWithFormattedDate = filteredUpcomingTasks.map((item) => {
    return {
      ...item,
      date: new Date(item?.date),
    };
  });

  const TasksSortedDateAsc = tasksWithFormattedDate.sort(
    (objA, objB) => Number(objA.date) - Number(objB.date)
  );

  const upcomingTasksSortedByDateAsc = TasksSortedDateAsc.map((item) => {
    return {
      ...item,
      date: new Date(item.date).toISOString().split('T')[0],
    };
  });

  return upcomingTasksSortedByDateAsc;
};

export default handleSortItemsAscending;
