import { CTA } from '../../components';
import moment from 'moment-timezone';

const AdminTableRow = ({
  email,
  isSubscribed,
  updatedAt,
  dashboardItemsCount,
  categoriesCount,
  remindersCount,
  notesCount,
  id,
  timezone,
}) => {
  return (
    <tr>
      <td data-label='User'>{email}</td>
      <td data-label='Subscribed'>{isSubscribed ? 'Yes' : 'No'}</td>
      <td data-label='Last Login'>
        {moment(updatedAt).tz(timezone).format('M/D/YYYY')}
      </td>
      <td data-label='Items'>{dashboardItemsCount}</td>
      <td data-label='Categories'>{categoriesCount}</td>
      <td data-label='Reminders'>{remindersCount}</td>
      <td data-label='Notes'>{notesCount}</td>
      <td className='admin-table__button'>
        <CTA
          text='Delete'
          className='cta-button cta-button--small cta-button--full cta-button--red'
          ariaLabel='Delete user account'
          //showSpinner={isAwaitingConfirmResponse}
          handleClick={() => {
            //setIsAwaitingConfirmResponse(true);
            //handleConfirm(confirmId);
          }}
        />
      </td>
    </tr>
  );
};

export default AdminTableRow;
