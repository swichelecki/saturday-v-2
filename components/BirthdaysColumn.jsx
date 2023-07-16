import ListItemBirthday from './ListItemBirthday';
import { FaBirthdayCake } from 'react-icons/fa';

const BirthdaysColumn = ({ birthdays }) => {
  if (!birthdays?.length) {
    return null;
  }

  return (
    <div className='items-column'>
      <h2>
        <FaBirthdayCake />
        Birthdays
      </h2>
      {birthdays?.map((item, index) => (
        <ListItemBirthday
          key={`birthday_${index}`}
          name={item?.name}
          date={item?.date}
        />
      ))}
    </div>
  );
};

export default BirthdaysColumn;
