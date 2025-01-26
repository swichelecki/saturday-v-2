import { useAppContext } from '../context';

// close list items that are open on the y axis after create, update, delete or some other action
export const useCloseListItemsYAxis = () => {
  const { setCloseListItemsYAxis } = useAppContext();

  const handleCloseListItemsYAxis = () => {
    const allItems = Array.from(
      document.querySelectorAll('.list-item__details')
    );
    allItems.forEach((item) => {
      item.style.transition = 'unset';
      item.style.height = '0';
    });

    setCloseListItemsYAxis(true);
  };

  return handleCloseListItemsYAxis;
};
