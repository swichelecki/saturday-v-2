'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '../../context';
import dynamic from 'next/dynamic';
import { stripeSubscribe } from '../../actions';
import { SubscriptionFeatures } from '../../components';

const Toast = dynamic(() => import('../../components/shared/Toast'), {
  ssr: false,
});

const ModalSubscribe = ({ userId }) => {
  const router = useRouter();

  const { setShowToast } = useAppContext();

  const [isAwaitingStripeResponse, setIsAwaitingStripeResponse] =
    useState(false);

  // handle stripe subscribe, unsubscribe or resubscribe
  const handleSubscribe = async () => {
    setIsAwaitingStripeResponse(true);
    const response = await stripeSubscribe(userId);
    const { url, status } = response;

    if (status === 200) {
      router.push(url);
    } else {
      setIsAwaitingStripeResponse(false);
      setShowToast(<Toast serverError={response} />);
    }
  };

  return (
    <>
      <h2>Subscribe</h2>
      <div className='subscription-features__modal-table-wrapper'>
        <SubscriptionFeatures />
      </div>
      <div className='form-page__buttons-wrapper'>
        <button
          type='button'
          className='entry-form__button'
          onClick={handleSubscribe}
        >
          {isAwaitingStripeResponse && <div className='loader'></div>}
          Subscribe Now
        </button>
      </div>
    </>
  );
};

export default ModalSubscribe;
