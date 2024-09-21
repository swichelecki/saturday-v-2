'use client';

import { useRef } from 'react';
import { useAppContext } from '../../context';
import { IoClose } from 'react-icons/io5';

const UserAlert = () => {
  const userAlertRef = useRef(null);
  const { userId } = useAppContext();

  const handleHideUserAlert = () => {
    userAlertRef.current.remove();
  };

  return (
    <div
      ref={userAlertRef}
      className={!userId ? `user-alert user-alert--homepage` : 'user-alert'}
    >
      Saturday is in beta. Please try it out!
      <button onClick={handleHideUserAlert}>
        <IoClose />
      </button>
    </div>
  );
};

export default UserAlert;
