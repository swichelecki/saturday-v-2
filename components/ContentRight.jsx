import Upcoming from './Upcoming';
import Birthdays from './Birthdays';

const ContentRight = () => {
  return (
    <section className='content-right-container'>
      <Upcoming />
      <Birthdays />
    </section>
  );
};

export default ContentRight;
