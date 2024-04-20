const handleReminderBufferFormat = (buffer) => {
  let bufferFormatted = '';
  switch (buffer) {
    case 0:
      bufferFormatted = '';
      break;
    case 7:
      bufferFormatted = 'One Week';
      break;
    case 14:
      bufferFormatted = 'Two Weeks';
      break;
    case 21:
      bufferFormatted = 'Three Weeks';
      break;
  }
  return bufferFormatted;
};

export default handleReminderBufferFormat;
