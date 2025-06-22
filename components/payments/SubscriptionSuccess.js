'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { updateCookieOnStripeSubscribe } from '../../actions';
import { useAppContext } from '../../context';
import { Toast } from '../../components';

const SubscriptionSuccess = ({ userId }) => {
  /* TODO: handle middleware setup if needed */

  const router = useRouter();
  //const { userId, timezone, admin, customerId, isSubscribed, status } = user;
  const { setUserId, setIsAdmin, setShowToast } = useAppContext();

  // temporary state for testing
  const [isSubscribed, setIsSubscribed] = useState();
  const [customerId, setCustomerId] = useState();

  // set global context user id and timezone and state timezone
  useEffect(() => {
    updateCookieOnStripeSubscribe(userId).then((res) => {
      if (res.status === 200) {
        const { userId, admin, isSubscribed, customerId } = res.user;

        console.log('RES ', res);
        setUserId(userId);
        setIsAdmin(admin);

        // temporary for testing
        setIsSubscribed(isSubscribed);
        setCustomerId(customerId);
      }

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
    <div>
      <h1>Subscription Success</h1>
      <p>customerId: {customerId} </p>
      <p>isSubscribed: {isSubscribed ? 'Yes' : 'No'} </p>
      <button onClick={handleGoToDashboard} type='button'>
        Go to Dashboard
      </button>
    </div>
  );
};

export default SubscriptionSuccess;
