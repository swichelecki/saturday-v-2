'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '../../context';
import { stripeSubscribe, stripeManageSubscription } from '../../actions';
import { Toast } from '../../components';

const ModalSubscribe = ({ userNoLongerSubscribed, userId }) => {
  const router = useRouter();

  const { setShowToast } = useAppContext();

  const [isAwaitingStripeResponse, setIsAwaitingStripeResponse] =
    useState(false);

  // handle stripe subscribe
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

  // handle stripe unsubscribe or resubscribe
  const handleManageSubscription = async () => {
    setIsAwaitingStripeResponse(true);
    const response = await stripeManageSubscription(userId);
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
      <div className='form-field'>
        {userNoLongerSubscribed ? (
          <p>
            Why'd you leave? Sign back up for Saturday's paid tier today for
            just $1 per month and get yourself organized! Powered by Stripe.
          </p>
        ) : (
          <p>
            Sorry, you've hit the free tier's item limit for this feature.
            Subscribe to Saturday's paid tier today for just $1 per month and
            get yourself organized! Powered by Stripe.
          </p>
        )}
      </div>

      <div className='form-page__buttons-wrapper'>
        <button
          type='button'
          className='entry-form__button'
          onClick={
            userNoLongerSubscribed ? handleManageSubscription : handleSubscribe
          }
        >
          {isAwaitingStripeResponse && <div className='loader'></div>}
          Subscribe Now
        </button>
      </div>
    </>
  );
};

export default ModalSubscribe;
