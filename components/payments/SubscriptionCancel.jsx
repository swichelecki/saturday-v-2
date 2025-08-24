'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { updateCookieOnStripeSubscribe } from '../../actions';
import { useAppContext } from '../../context';
import { Toast } from '..';

const SubscriptionCancel = ({ user }) => {
  const router = useRouter();
  const { userId, admin } = user;
  const { setUserId, setIsAdmin, setShowToast } = useAppContext();

  // create new cookie with stripe information
  useEffect(() => {
    // set global context
    setUserId(userId);
    setIsAdmin(admin);

    updateCookieOnStripeSubscribe(userId).then((res) => {
      if (res.status === 500) {
        setShowToast(<Toast serverError={res} />);
        console.error(res.error);
      }
    });
  }, []);

  const handleGoToContact = () => {
    router.push('/contact');
  };

  return (
    <div className='form-page form-page--gap-48'>
      <h1>Sorry to See You Go!</h1>
      <p>
        Please take a minute to tell us why you decided to cancel by sending us
        a message through our contact page.
      </p>
      <div className='dashboard-button-wrapper'>
        <button
          onClick={handleGoToContact}
          type='button'
          className='entry-form__button'
        >
          Contact
        </button>
      </div>
    </div>
  );
};

export default SubscriptionCancel;
