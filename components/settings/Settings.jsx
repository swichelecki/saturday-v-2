'use client';

import { useEffect } from 'react';
import { useAppContext } from '../../context';
import { CategoryControls, RemindersControls } from '../../components';

const Settings = ({ categories, reminders, userId }) => {
  const { setUserId } = useAppContext();

  // set global context user id
  useEffect(() => {
    setUserId(userId);
  }, []);

  return (
    <div className='form-page'>
      <CategoryControls categories={categories} userId={userId} />
      <RemindersControls reminders={reminders} userId={userId} />
    </div>
  );
};

export default Settings;
