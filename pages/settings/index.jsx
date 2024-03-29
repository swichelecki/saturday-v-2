import { useEffect } from 'react';
import { getCookie } from 'cookies-next';
import { jwtVerify } from 'jose';
import Category from '../../models/Category';
import Reminder from '../../models/Reminder';
import { useAppContext } from 'context';
import { CategoryControls, RemindersControls } from 'components';

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

export async function getServerSideProps(context) {
  try {
    const { req, res } = context;
    const jwtSecret = process.env.JWT_SECRET;
    const token = getCookie('saturday', { req, res });

    let userId;

    if (token) {
      try {
        const { payload } = await jwtVerify(
          token,
          new TextEncoder().encode(jwtSecret)
        );
        if (payload?.id) {
          userId = payload?.id;
        }
      } catch (error) {
        console.log(error);
      }
    }

    const categories = await Category.find({ userId }).sort({
      priority: 1,
    });

    const reminders = await Reminder.find({ userId }).sort({ reminderDate: 1 });

    return {
      props: {
        categories: JSON.parse(JSON.stringify(categories)),
        reminders: JSON.parse(JSON.stringify(reminders)),
        userId,
      },
    };
  } catch (error) {
    console.log(error);
  }
}

export default Settings;
