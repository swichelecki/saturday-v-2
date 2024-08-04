import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useAppContext } from '../context';
import { IoIosInformationCircle } from 'react-icons/io';

const SettingsNewUserPrompt = dynamic(() =>
  import('../components/settings/SettingsNewUserPrompt')
);

export const usePrompt = () => {
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
          <h2>
            <IoIosInformationCircle />
            Categories
          </h2>
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
        document.getElementById('createCategoryButton').click();
      };

      setShowPrompt(
        <SettingsNewUserPrompt handleGotItButton={handleGotItButton}>
          <h2>
            <IoIosInformationCircle />
            Reminders
          </h2>
          You don't need to set these up now to use Saturday. Reminders are for
          tasks and events with recurring intervals&#8212;birthdays,
          anniversaries, mortgage payments, car payments, etc.
        </SettingsNewUserPrompt>
      );
    }

    // handle new user dashboard prompt
    if (isDashboardPrompt) {
      const handleGotItButton = () => {
        setShowPrompt(null);
        setIsDashboardPrompt(false);
      };

      setShowPrompt(
        <SettingsNewUserPrompt handleGotItButton={handleGotItButton}>
          <h2>
            <IoIosInformationCircle />
            Dashboard
          </h2>
          Great! You have your first category. When you are ready to start using
          Saturday, go to your dashboard by clicking "Saturday" at the top left,
          or the user icon at the top right and then select Dashboard from the
          menu.
        </SettingsNewUserPrompt>
      );
    }
  }, [isCategoriesPrompt, isRemindersPrompt, isDashboardPrompt]);
};
