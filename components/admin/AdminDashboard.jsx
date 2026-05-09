'use client';

import { useAppContext } from '../../context';
import { AdminTable, ModalAdminDeleteUser, Modal } from '../../components';

const AdminDashboard = ({ users, user }) => {
  const { userId: adminId, timezone } = user;

  const { setShowModal } = useAppContext();

  const handleOpenDeleteUserModal = (id, email) => {
    setShowModal(
      <Modal showCloseButton={false}>
        <ModalAdminDeleteUser adminId={adminId} userId={id} userEmail={email} />
      </Modal>,
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
