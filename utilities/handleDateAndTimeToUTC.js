export const handleDateAndTimeToUTC = (dateAndTime) => {
  if (!dateAndTime) return;
  return new Date(dateAndTime).toISOString();
};
