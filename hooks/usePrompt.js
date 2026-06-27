import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { updateUserNoLongerNew, updateUserHasSeenNotes } from '../actions';
import { useAppContext } from '../context';

const Prompt = dynamic(() => import('../components/shared/Prompt'));
const Toast = dynamic(() => import('../components/shared/Toast'), {
  ssr: false,
});

export const usePrompt = (userId, userStatus) => {
  const {
    isCategoriesPrompt,
    setIsCategoriesPrompt,
    isRemindersPrompt,
    setIsRemindersPrompt,
    isDashboardPrompt,
    setIsDashboardPrompt,
    isNotesPrompt,
    setIsNotesPrompt,
    setShowPrompt,
  } = useAppContext();

  useEffect(() => {
    if (!userStatus) return;

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
        <Prompt handleGotItButton={handleGotItButton}>
          <h2>Categories</h2>
          <p>
            Create at least one category to use Saturday. These are areas of
            your life in which you could use a bit of help keeping track of
            things&#8212;work, school, shopping, appointments, events, etc.
          </p>
          <p>
            Categories serve as the column headings on your dashboard, under
            which the items you create will be grouped together.
          </p>
        </Prompt>,
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
        <Prompt handleGotItButton={handleGotItButton}>
          <h2>Recurring Reminders</h2>
          <p>
            You don’t need to set these up now to use Saturday. Reminders are
            for tasks and events with recurring intervals&#8212;birthdays,
            anniversaries, bills, car maintenance, etc.
          </p>
          <p>
            Recurring reminders will appear on your dashboard as the next
            recurrence date approaches.
          </p>
        </Prompt>,
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
        <Prompt handleGotItButton={handleGotItButton}>
          <h2>Dashboard</h2>
          <p>
            One down! Create more categories and when you are ready to start
            using Saturday, go to your dashboard by clicking
            &ldquo;Saturday&rdquo; at the top left, or select
            &ldquo;Dashboard&rdquo; after clicking the user icon at the top
            right.
          </p>
          <p>
            On your dashboard you will see the &ldquo;Create Item&rdquo; button.
            Click it to open the modal from which category options are selected
            and start adding items. Come back here&#8212;Settings&#8212;whenever
            you want to update your categories or recurring reminders.
          </p>
        </Prompt>,
      );
    }

    if (isNotesPrompt) {
      const handleGotItButton = () => {
        updateUserHasSeenNotes(userId).then((response) => {
          if (response.status === 200) {
            setShowPrompt(null);
            setIsNotesPrompt(false);
          } else {
            setShowToast(<Toast serverError={response} />);
          }
        });
      };

      setShowPrompt(
        <Prompt handleGotItButton={handleGotItButton}>
          <h2>Notes</h2>
          <p>
            This is the place to keep bits of information which you want to keep
            handy for a long period of time, or where you can create longer,
            more-detailed entries than will fit in the dashboard items.
          </p>
        </Prompt>,
      );
    }
  }, [isCategoriesPrompt, isRemindersPrompt, isDashboardPrompt, isNotesPrompt]);
};
