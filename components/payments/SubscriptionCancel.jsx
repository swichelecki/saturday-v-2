'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { updateCookieOnStripeSubscribe } from '../../actions';
import { useAppContext } from '../../context';

const Toast = dynamic(() => import('../../components/shared/Toast'), {
  ssr: false,
});

const SubscriptionCancel = ({ userId }) => {
  const router = useRouter();
  const { setShowToast } = useAppContext();

  // create new cookie with stripe information
  useEffect(() => {
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
