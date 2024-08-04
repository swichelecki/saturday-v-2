'use client';

import { useEffect } from 'react';
import { useAppContext } from '../../context';
import { usePrompt } from '../../hooks';
import { CategoryControls, RemindersControls } from '../../components';

const Settings = ({ categories, reminders, userId, newUser }) => {
  const { setUserId, setIsCategoriesPrompt } = useAppContext();

  // if new user show prompts
  usePrompt();

  // set global context user id and first new user prompt
  useEffect(() => {
    setUserId(userId);
    if (newUser) setIsCategoriesPrompt(true);
  }, []);

  return (
    <div className='form-page'>
      <CategoryControls
        categories={categories}
        userId={userId}
        newUser={newUser}
      />
      <RemindersControls reminders={reminders} userId={userId} />
    </div>
  );
};

export default Settings;
