const handleIntervalFormat = (interval) => {
  let intervalFormatted = '';
  switch (interval) {
    case 1:
      intervalFormatted = 'Monthly';
      break;
    case 2:
      intervalFormatted = 'Every Two Months';
      break;
    case 3:
      intervalFormatted = 'Every Three Months';
      break;
    case 4:
      intervalFormatted = 'Every Four Months';
      break;
    case 5:
      intervalFormatted = 'Every Five Months';
      break;
    case 6:
      intervalFormatted = 'Every Six Months';
      break;
    case 7:
      intervalFormatted = 'Every Seven Months';
      break;
    case 8:
      intervalFormatted = 'Every Eight Months';
      break;
    case 9:
      intervalFormatted = 'Every Nine Months';
      break;
    case 10:
      intervalFormatted = 'Every 10 Months';
      break;
    case 11:
      intervalFormatted = 'Every 11 Months';
      break;
    case 12:
      intervalFormatted = 'Annually';
      break;
    case 604800000:
      intervalFormatted = 'Weekly';
      break;
    case 1209600000:
      intervalFormatted = 'Every Two Weeks';
      break;
    case 1814400000:
      intervalFormatted = 'Every Three Weeks';
      break;
    case 2419200000:
      intervalFormatted = 'Every Four Weeks';
      break;
  }
  return intervalFormatted;
};

export default handleIntervalFormat;
