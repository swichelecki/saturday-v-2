const handleTodaysDateCheck = (date) => {
  const todaysDate = new Date();
  return todaysDate.toISOString().split('T')[0] === date.split('T')[0];
};

export default handleTodaysDateCheck;
