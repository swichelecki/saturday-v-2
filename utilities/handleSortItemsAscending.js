export const handleSortItemsAscending = (filteredUpcomingTasks, keyName) => {
  const tasksWithFormattedDate = filteredUpcomingTasks.map((item) => {
    return {
      ...item,
      [keyName]: new Date(item[keyName]),
    };
  });

  const TasksSortedDateAsc = tasksWithFormattedDate.sort(
    (objA, objB) => Number(objA[keyName]) - Number(objB[keyName])
  );

  const upcomingTasksSortedByDateAsc = TasksSortedDateAsc.map((item) => {
    return {
      ...item,
      [keyName]: item[keyName]
        ? new Date(item[keyName]).toISOString().split('T')[0]
        : null,
    };
  });

  return upcomingTasksSortedByDateAsc;
};
