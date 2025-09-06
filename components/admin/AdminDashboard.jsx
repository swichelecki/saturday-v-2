'use client';

import { useEffect } from 'react';
import { useAppContext } from '../../context';
import { AdminTable, Modal, ModalAdminDeleteUser } from '../../components';

const AdminDashboard = ({ users, user }) => {
  const { userId: adminId, admin, timezone } = user;

  const { setUserId, setIsAdmin, setShowModal } = useAppContext();

  useEffect(() => {
    // set global context
    setUserId(adminId);
    setIsAdmin(admin);
  }, []);

  const handleOpenDeleteUserModal = (id, email) => {
    setShowModal(
      <Modal showCloseButton={false}>
        <ModalAdminDeleteUser adminId={adminId} userId={id} userEmail={email} />
      </Modal>
    );
  };

  return (
    <div className='admin-content-container'>
      <h1>Administration Dashboard</h1>
      <AdminTable
        users={users}
        timezone={timezone}
        handleOpenDeleteUserModal={handleOpenDeleteUserModal}
      />
    </div>
  );
};

export default AdminDashboard;
