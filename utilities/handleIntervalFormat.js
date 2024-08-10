import { FORM_REMINDER_INTERVAL_OPTIONS } from '../constants';

export const handleIntervalFormat = (interval) => {
  const intervalObject = FORM_REMINDER_INTERVAL_OPTIONS?.find(
    (item) => item?.value === interval
  );
  return intervalObject['title'];
};
