'use client';

import { useEffect } from 'react';
import { useAppContext } from '../../context';
import { usePrompt } from '../../hooks';
import { CategoryControls, RemindersControls } from '../../components';

const Settings = ({ categories, reminders, user }) => {
  const { userId, newUser, admin } = user;
  const { setUserId, setIsCategoriesPrompt, setIsAdmin } = useAppContext();

  // if new user show prompts
  usePrompt(userId, newUser);

  // set global contexts
  useEffect(() => {
    setUserId(userId);
    setIsAdmin(admin);
    if (newUser) setIsCategoriesPrompt(true);
  }, []);

  return (
    <div className='form-page'>
      {newUser && (
        <div className='settings-prompt__new-user-background-overlay' />
      )}
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
