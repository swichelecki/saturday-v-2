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
  usePrompt();

  // set global contexts
  useEffect(() => {
    setUserId(userId);
    setTimezone(timezone);
    setIsAdmin(admin);
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
