import moment from 'moment-timezone';

const handleTodaysDateCheck = (date) => {
  return moment().format('YYYY-MM-DD') === date;
};

export default handleTodaysDateCheck;
