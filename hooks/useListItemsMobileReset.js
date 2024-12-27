import { useAppContext } from '../context';

// ensure all items are closed on mobile after new item is created, item is updated or item is deleted
export const useListItemsMobileReset = () => {
  const { setListItemsMobileReset } = useAppContext();

  const handleListItemsMobileReset = () => {
    const allItems = Array.from(document.querySelectorAll('.list-item__item'));
    allItems.forEach((item) => {
      item.style.transition = 'unset';
      item.style.transform = 'translateX(0)';
    });

    setListItemsMobileReset(true);
  };

  return handleListItemsMobileReset;
};
