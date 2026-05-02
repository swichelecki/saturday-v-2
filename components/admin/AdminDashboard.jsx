'use client';

import dynamic from 'next/dynamic';
import { useAppContext } from '../../context';
import { AdminTable, ModalAdminDeleteUser } from '../../components';

const Modal = dynamic(() => import('../../components/shared/Modal'), {
  ssr: false,
});

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
