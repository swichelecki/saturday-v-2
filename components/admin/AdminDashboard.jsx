'use client';

import { useEffect } from 'react';
import { useAppContext } from '../../context';
import { AdminTable } from '../../components';

const AdminDashboard = ({ users, user }) => {
  const { userId, admin, timezone } = user;

  const { setUserId, setIsAdmin } = useAppContext();

  useEffect(() => {
    // set global context
    setUserId(userId);
    setIsAdmin(admin);
  }, []);

  return (
    <div className='admin-content-container'>
      <h1>Administration Dashboard</h1>
      <AdminTable users={users} timezone={timezone} />
    </div>
  );
};

export default AdminDashboard;
