import { CategoryControls, RemindersControls } from '../../components';

const Settings = ({ categories, reminders, user }) => {
  return (
    <div className='form-page form-page__list-items'>
      <CategoryControls categories={categories} user={user} />
      <RemindersControls reminders={reminders} user={user} />
    </div>
  );
};

export default Settings;
