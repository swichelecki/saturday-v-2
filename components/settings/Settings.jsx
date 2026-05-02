'use client';

import { useEffect } from 'react';
import { useAppContext } from '../../context';
import { usePrompt } from '../../hooks';
import { CategoryControls, RemindersControls } from '../../components';

const Settings = ({ categories, reminders, user }) => {
  const { userId, newUser } = user;
  const { setIsCategoriesPrompt } = useAppContext();

  // if new user show prompts
  usePrompt(userId, newUser);

  useEffect(() => {
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
