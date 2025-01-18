import {
  handleReminderBufferFormat,
  handleIntervalFormat,
} from '../../utilities';
import moment from 'moment-timezone';

const TooltipReminderMessage = ({
  reminderDate,
  recurrenceInterval,
  exactRecurringDate,
  recurrenceBuffer,
}) => {
  const nextDisplayDateMessage = 'Next Display Date';
  const currentlyDisplayedMessage = 'Currently Displayed';

  const handleNoEarlyWarningDisplayMessage = () => {
    if (exactRecurringDate) return <></>;
    return new Date(reminderDate).getTime() > Date.now()
      ? nextDisplayDateMessage
      : currentlyDisplayedMessage;
  };

  const handleEarlyWarningDisplayMessage = () => {
    if (!exactRecurringDate) return <></>;
    let displayDate;
    const date = new Date(reminderDate);
    displayDate = date.setDate(date.getDate() - recurrenceBuffer);
    return displayDate > Date.now()
      ? `Displays ${handleReminderBufferFormat(recurrenceBuffer)} Prior`
      : currentlyDisplayedMessage;
  };

  return (
    <>
      <p>{handleNoEarlyWarningDisplayMessage()}</p>
      <p>{handleEarlyWarningDisplayMessage()}</p>
      <p>
        <span>
          {moment(reminderDate.split('T')[0]).format('ddd, MMM D, YYYY')}
        </span>
      </p>
      <p>
        Interval: <span>{handleIntervalFormat(recurrenceInterval)}</span>
      </p>
    </>
  );
};

export default TooltipReminderMessage;
