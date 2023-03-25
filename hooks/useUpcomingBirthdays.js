import { useState, useEffect } from 'react';
import { getBirthdays, updateBirthdays } from '../services';

export const useUpcomingBirthdays = () => {
  const [birthdays, setBirthdays] = useState([]);
  const [pastBirthdays, setPastBirthdays] = useState([]);

  useEffect(() => {
    const date = new Date();
    const addThirteenDaysToDate = date.setDate(date.getDate() + 13);
    const todayPlusThirteenDays = new Date(addThirteenDaysToDate);
    const upcomingBirthdays = [];
    const pastBirthdays = [];

    getBirthdays().then((res) => {
      res.forEach((item) => {
        const birthdayDate = new Date(item?.date);
        if (
          birthdayDate.getTime() >= Date.now() - 86400000 &&
          birthdayDate.getTime() <= todayPlusThirteenDays.getTime()
        ) {
          upcomingBirthdays.push(item);
        } else if (birthdayDate.getTime() < Date.now() - 86400000) {
          pastBirthdays.push(item);
        }
      });

      if (upcomingBirthdays.length > 0) {
        setBirthdays(upcomingBirthdays);
      }

      if (pastBirthdays.length > 0) {
        setPastBirthdays(pastBirthdays);
      }
    });
  }, []);

  useEffect(() => {
    if (pastBirthdays.length > 0) {
      const addOneYear = (date) => {
        const nextBirthday = new Date(date);
        nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);
        return nextBirthday.toISOString();
      };
      const updatedBirthdays = pastBirthdays.map((item) => ({
        ...item,
        date: addOneYear(item?.date),
      }));
      updatedBirthdays.forEach((item) => updateBirthdays(item));
    }
  }, [pastBirthdays]);

  return birthdays;
};
