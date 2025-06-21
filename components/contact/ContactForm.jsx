'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormTextField, FormWYSIWYGField, Toast } from '../';
import { useAppContext } from '../../context';
import { createContactMessage, stripeSubscribe } from '../../actions';
import { useScrollToError } from '../../hooks';
import { contactFormSchema } from '../../schemas/schemas';

const ContactForm = ({ user }) => {
  /* TODO: Stripe setup code. Move to appropriate files */
  const router = useRouter();
  /* TODO: END Stripe setup code. Move to appropriate files */

  const formRef = useRef(null);
  const { userId, admin, email } = user;
  const { setUserId, setShowToast, setIsAdmin } = useAppContext();

  // set global context user id and timezone and state timezone
  useEffect(() => {
    setUserId(userId);
    setIsAdmin(admin);
  }, []);

  const [form, setForm] = useState({
    userId,
    email,
    subject: '',
    message: '',
  });
  const [errorMessage, setErrorMessage] = useState({
    subject: '',
    message: '',
  });
  const [isAwaitingContactFormResponse, setIsAwaitingContactFormResponse] =
    useState(false);
  const [scrollToErrorMessage, setScrollToErrorMessage] = useState(false);

  useScrollToError(formRef, scrollToErrorMessage, setScrollToErrorMessage);

  const handleForm = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });

    if (errorMessage[e.target.name]) {
      setErrorMessage({ ...errorMessage, [e.target.name]: '' });
    }
  };

  const handleSetQuill = (value) => {
    setForm({ ...form, message: value });

    if (errorMessage.message) {
      setErrorMessage({ ...errorMessage, message: '' });
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    const zodValidationResults = contactFormSchema.safeParse(form);

    const { data: zodFormData, success, error } = zodValidationResults;
    if (!success) {
      const { subject, message } = error.flatten().fieldErrors;

      if (!subject && !message) {
        const serverError = {
          status: 400,
          error: 'Zod validation failed Check console.',
        };
        setShowToast(<Toast serverError={serverError} />);
        console.error(error);
        return;
      }

      setErrorMessage({
        subject: subject?.[0],
        message: message?.[0],
      });
      setScrollToErrorMessage(true);
      return;
    }

    setIsAwaitingContactFormResponse(true);
    const response = await createContactMessage(zodFormData);
    if (response.status === 200) {
      setIsAwaitingContactFormResponse(false);
      setForm({ subject: '', message: '<p><br></p>' });
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
      setShowToast(<Toast isSuccess message='Thanks for the feedback!' />);
    } else {
      setShowToast(<Toast serverError={response} />);
      setIsAwaitingContactFormResponse(false);
    }
  };

  /* TODO: Stripe setup code. Move to appropriate files */
  /* youtube video: https://www.youtube.com/watch?v=NfeFXQwmDXA */
  /* TODO: Don't forget to use production env vars in Heroku */
  const handleSubscribe = async () => {
    const response = await stripeSubscribe(userId, email);
    const { url, status } = response;

    if (status === 200) {
      router.push(url);
    } else {
      setShowToast(<Toast serverError={response} />);
    }
  };

  const handleManageSubscription = async () => {
    const url = process.env.NEXT_PUBLIC_STRIPE_CUSTOMER_PORTAL;
    if (url) {
      router.push(`${url}?prefilled_email=${email}`);
    }
  };
  /* TODO: END Stripe setup code. Move to appropriate files */

  return (
    <form onSubmit={onSubmit} ref={formRef} className='form-page contact-form'>
      {/* TODO: Stripe setup code. Move to appropriate files */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}
      >
        <button type='button' onClick={handleSubscribe}>
          Subscribe
        </button>
        <button type='button' onClick={handleManageSubscription}>
          Manage Subscription
        </button>
      </div>
      {/* TODO: END Stripe setup code. Move to appropriate files */}

      <h1 className='form-page__h2'>Contact</h1>
      <FormTextField
        label='Email'
        type='email novalidate'
        id='email'
        name='email'
        value={email}
        disabled
      />
      <FormTextField
        label='Subject'
        type='text'
        id='subject'
        name='subject'
        value={form?.subject}
        onChangeHandler={handleForm}
        errorMessage={errorMessage.subject}
      />
      <FormWYSIWYGField
        label='Message'
        hasToolbar={false}
        value={form?.message}
        onChangeHandler={handleSetQuill}
        errorMessage={errorMessage.message}
      />
      <div className='form-page__buttons-wrapper'>
        <Link href='/'>
          <span className='form-page__cancel-button'>Cancel</span>
        </Link>
        <button type='submit' className='form-page__save-button'>
          {isAwaitingContactFormResponse && <div className='loader'></div>}
          Submit
        </button>
      </div>
    </form>
  );
};

export default ContactForm;
