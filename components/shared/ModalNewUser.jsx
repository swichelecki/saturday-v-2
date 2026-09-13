'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useAppContext } from '../../context';
import { updateUserNoLongerNew } from '../../actions';
import { CTA } from '../../components';
import { handleModalResetPageScrolling } from '../../utilities';
import { ImCheckmark } from 'react-icons/im';

const Toast = dynamic(() => import('../../components/shared/Toast'), {
  ssr: false,
});

const ModalNewUser = ({ userId }) => {
  const { setShowModal, setShowToast } = useAppContext();

  const [isAwaitingResponse, setIsAwaitingResponse] = useState(false);

  const handleNewUser = () => {
    setIsAwaitingResponse(true);
    updateUserNoLongerNew(userId).then((response) => {
      if (response.status === 200) {
        setShowModal(null);
        handleModalResetPageScrolling();
      } else {
        setShowToast(<Toast serverError={response} />);
      }
    });
  };

  return (
    <div className='new-user-modal'>
      <h2>Welcome to Saturday!</h2>
      <div className='new-user-modal__features-list'>
        <ul>
          <li>
            <ImCheckmark />
            Add items to your dashboard with the &apos;Create Item&apos; button
          </li>
          <li>
            <ImCheckmark />
            Set up recurring reminders with the &apos;Create Recurring
            Reminder&apos; button
          </li>
          <li>
            <ImCheckmark />
            Click the user icon at the top right for more features
          </li>
        </ul>
      </div>
      <div className='modal__modal-button-wrapper'>
        <CTA
          text='Got It'
          className='cta-button cta-button--medium cta-button--full cta-button--purple'
          ariaLabel='Close modal to start using Saturday'
          showSpinner={isAwaitingResponse}
          handleClick={handleNewUser}
        />
      </div>
    </div>
  );
};

export default ModalNewUser;
