// close currently open item when a new item is opened
export const handleCloseOpenItem = (currentItemId) => {
  const allItems = Array.from(document.querySelectorAll('.list-item__item'));
  allItems.forEach((item) => {
    if (item?.id !== currentItemId) {
      item.style.transition = 'transform 150ms';
      item.style.transform = 'translateX(0)';
    }
  });
  return currentItemId;
};
