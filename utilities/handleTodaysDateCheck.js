import moment from 'moment-timezone';

export const handleTodaysDateCheck = (date) => {
  return moment().format('YYYY-MM-DD') === date;
};
