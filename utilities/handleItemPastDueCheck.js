import moment from 'moment-timezone';

export const handleItemPastDueCheck = (date) => {
  return moment().format('YYYY-MM-DD') > date;
};
