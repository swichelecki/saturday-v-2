import { ListItem } from '../../components';
import { ITEM_TYPE_NOTE } from '../../constants';

const NoteGroup = ({
  heading,
  items,
  handleDeleteItem,
  getItemToUpdate,
  itemToUpdateId,
  isAwaitingEditResponse,
  handlePinNote,
}) => {
  if (!items?.length) return <></>;

  return (
    <div className='notes notes__notes-group'>
      <h2>{heading}</h2>
      <div>
        {items?.map((item, index) => (
          <ListItem
            item={item}
            key={`list-item__${index}`}
            index={index}
            itemType={ITEM_TYPE_NOTE}
            handleDeleteItem={handleDeleteItem}
            getItemToUpdate={getItemToUpdate}
            itemToUpdateId={itemToUpdateId}
            isAwaitingEditResponse={isAwaitingEditResponse}
            numberOfItemsInColumn={items?.length}
            handlePinNote={handlePinNote}
          />
        ))}
      </div>
    </div>
  );
};

export default NoteGroup;
