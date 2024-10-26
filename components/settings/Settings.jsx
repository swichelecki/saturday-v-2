'use client';

import { useEffect } from 'react';
import { useAppContext } from '../../context';
import { usePrompt } from '../../hooks';
import { CategoryControls, RemindersControls } from '../../components';

const Settings = ({ categories, reminders, user }) => {
  const { userId, newUser, timezone, admin } = user;
  const { setUserId, setTimezone, setIsCategoriesPrompt, setIsAdmin } =
    useAppContext();

  // if new user show prompts
  usePrompt(userId);

  // set global contexts
  useEffect(() => {
    setUserId(userId);
    setTimezone(timezone);
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
