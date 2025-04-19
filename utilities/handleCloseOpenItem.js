import { SLOW_TRANSITION_SPEED } from '../constants';

// close currently open item when a new item is opened
export const handleCloseOpenItem = (currentItemId) => {
  const allListItems = Array.from(
    document.querySelectorAll('.list-item__outer-wrapper')
  );

  allListItems.forEach((item) => {
    const listItemInner = item.querySelector('.list-item__item');

    if (listItemInner?.id !== currentItemId) {
      const updateButton = item.querySelector(
        '.list-item__edit-button.list-item__edit-button--mobile'
      );
      const detailsButton = item.querySelector(
        '.list-item__details-button.list-item__details-button--mobile'
      );
      const deleteButton = item.querySelector(
        '.list-item__delete-button.list-item__delete-button--mobile'
      );
      const details = item.querySelector('.list-item__details');

      listItemInner.style.transition = `transform ${SLOW_TRANSITION_SPEED}ms`;
      listItemInner.style.transform = 'translateX(0)';

      if (updateButton) {
        updateButton.style.transition = `transform ${SLOW_TRANSITION_SPEED}ms`;
        updateButton.style.transform = 'translateX(0)';
      }

      if (detailsButton) {
        detailsButton.style.transition = `transform ${SLOW_TRANSITION_SPEED}ms`;
        detailsButton.style.transform = 'translateX(0)';
      }

      deleteButton.style.transition = `transform ${SLOW_TRANSITION_SPEED}ms`;
      deleteButton.style.transform = 'translateX(0)';

      details.style.height = '0';
    }
  });
  return currentItemId;
};
