import moment from 'moment-timezone';

const handleTodaysDateCheck = (date) => {
  const todaysDate = new Date();
  return (
    moment(todaysDate.toISOString().split('T')[0])
      .tz('America/Chicago')
      .format('yyyy-MM-DD') === date.split('T')[0]
  );
};

export default handleTodaysDateCheck;
