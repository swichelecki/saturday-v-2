import { AdminTableRow } from '../../components';

const AdminTable = ({ users, timezone }) => {
  return (
    <table className='admin-table'>
      <thead>
        <tr>
          <th scope='col'>User</th>
          <th scope='col'>Subscribed</th>
          <th scope='col'>Last Login</th>
          <th scope='col'>Items</th>
          <th scope='col'>Categories</th>
          <th scope='col'>Reminders</th>
          <th scope='col'>Notes</th>
          <th scope='col'></th>
        </tr>
      </thead>
      <tbody>
        {users?.length > 0 &&
          users.map((item, index) => (
            <AdminTableRow
              key={`admin-table-row__${index}`}
              timezone={timezone}
              id={item?._id}
              email={item?.email}
              isSubscribed={item?.isSubscribed}
              updatedAt={item?.updatedAt}
              dashboardItemsCount={item?.dashboardItemsCount}
              categoriesCount={item?.categoriesCount}
              remindersCount={item?.remindersCount}
              notesCount={item?.notesCount}
            />
          ))}
      </tbody>
    </table>
  );
};

export default AdminTable;
