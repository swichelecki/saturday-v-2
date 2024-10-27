import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { updateUserNoLongerNew } from '../actions';
import { useAppContext } from '../context';

const SettingsNewUserPrompt = dynamic(() =>
  import('../components/settings/SettingsNewUserPrompt')
);

export const usePrompt = (userId) => {
  const {
    isCategoriesPrompt,
    setIsCategoriesPrompt,
    isRemindersPrompt,
    setIsRemindersPrompt,
    isDashboardPrompt,
    setIsDashboardPrompt,
    setShowPrompt,
  } = useAppContext();

  useEffect(() => {
    if (!isCategoriesPrompt && !isRemindersPrompt && !isDashboardPrompt) return;

    // handle new user categories prompt
    if (isCategoriesPrompt) {
      const handleGotItButton = () => {
        setShowPrompt(null);
        setIsCategoriesPrompt(false);
        setIsRemindersPrompt(true);
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: 'smooth',
        });
      };

      setShowPrompt(
        <SettingsNewUserPrompt handleGotItButton={handleGotItButton}>
          <h2>Categories</h2>
          Create at least one category to use Saturday. These are areas of your
          life in which you could use a bit of help keeping track of
          things&#8212;work, school, shopping, appointments, events, etc.
        </SettingsNewUserPrompt>
      );
    }

    // handle new user reminders prompt
    if (isRemindersPrompt) {
      const handleGotItButton = () => {
        setShowPrompt(null);
        setIsRemindersPrompt(false);
        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
        setTimeout(() => {
          document.getElementById('createCategoryButton').click();
        }, 500);
      };

      setShowPrompt(
        <SettingsNewUserPrompt handleGotItButton={handleGotItButton}>
          <h2>Reminders</h2>
          You don’t need to set these up now to use Saturday. Reminders are for
          tasks and events with recurring intervals&#8212;birthdays,
          anniversaries, bills, car maintenance, etc.
        </SettingsNewUserPrompt>
      );
    }

    // handle new user dashboard prompt
    if (isDashboardPrompt) {
      const handleGotItButton = () => {
        updateUserNoLongerNew(userId).then((response) => {
          if (response.status === 200) {
            setShowPrompt(null);
            setIsDashboardPrompt(false);
          } else {
            setShowToast(<Toast serverError={response} />);
          }
        });
      };

      setShowPrompt(
        <SettingsNewUserPrompt handleGotItButton={handleGotItButton}>
          <h2>Dashboard</h2>
          One down! Create more categories and when you are ready to start using
          Saturday, go to your dashboard by clicking "Saturday" at the top left,
          or select "Dashboard" after clicking the user icon at the top right.
        </SettingsNewUserPrompt>
      );
    }
  }, [isCategoriesPrompt, isRemindersPrompt, isDashboardPrompt]);
};
