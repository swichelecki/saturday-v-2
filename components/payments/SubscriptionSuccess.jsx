'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { updateCookieOnStripeSubscribe } from '../../actions';
import { useAppContext } from '../../context';
import { SubscriptionFeatures, Toast } from '..';

const SubscriptionSuccess = ({ user }) => {
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

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  return (
    <div className='form-page form-page__gap-48'>
      <h1>Thank You for Supporting Saturday!</h1>
      <SubscriptionFeatures showCaption={false} />
      <p>
        Your $1 monthly subscription grants you full-access to Saturday. Thank
        you for supporting this human-made web application.
      </p>
      <div className='dashboard-button-wrapper'>
        <button
          onClick={handleGoToDashboard}
          type='button'
          className='entry-form__button'
        >
          Dashboard
        </button>
      </div>
    </div>
  );
};

export default SubscriptionSuccess;
