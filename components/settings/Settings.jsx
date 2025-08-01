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
    <div className='form-page form-page__list-items'>
      <CategoryControls categories={categories} user={user} />
      <RemindersControls reminders={reminders} user={user} />
    </div>
  );
};

export default Settings;
