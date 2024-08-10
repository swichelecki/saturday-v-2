import { FORM_REMINDER_BUFFER_OPTIONS } from '../constants';

export const handleReminderBufferFormat = (buffer) => {
  const bufferObject = FORM_REMINDER_BUFFER_OPTIONS?.find(
    (item) => item?.value === buffer
  );
  return bufferObject['title'];
};
