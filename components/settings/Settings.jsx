'use client';

import { useEffect } from 'react';
import { useAppContext } from '../../context';
import { CategoryControls, RemindersControls } from '../../components';

const Settings = ({ categories, reminders, userId, newUser }) => {
  const { setUserId } = useAppContext();

  // set global context user id
  useEffect(() => {
    setUserId(userId);
  }, []);

  return (
    <div className='form-page'>
      <CategoryControls
        categories={categories}
        userId={userId}
        newUser={newUser}
      />
      <RemindersControls
        reminders={reminders}
        userId={userId}
        newUser={newUser}
      />
    </div>
  );
};

export default Settings;
