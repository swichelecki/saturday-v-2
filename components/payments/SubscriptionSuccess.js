'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { updateCookieOnStripeSubscribe } from '../../actions';
import { useAppContext } from '../../context';
import { Toast } from '../../components';

const SubscriptionSuccess = ({ userId, admin }) => {
  const router = useRouter();
  const { setUserId, setIsAdmin, setShowToast } = useAppContext();

  // create new cookie with stripe information
  useEffect(() => {
    // set global context
    setUserId(userId);
    setIsAdmin(admin);

    updateCookieOnStripeSubscribe(userId).then((res) => {
      if (res.status !== 200) {
        setShowToast(<Toast serverError={res} />);
        console.error(res.error);
        return;
      }
    });
  }, []);

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  return (
    <div className='form-page'>
      <h1>Subscription Success</h1>
      <p className='form-field'>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
        veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
        commodo consequat.
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
