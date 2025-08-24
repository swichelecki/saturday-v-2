'use client';

import { useEffect, useState, useRef } from 'react';
import { FormTextField, FormWYSIWYGField, Toast, CTA } from '../';
import { useAppContext } from '../../context';
import { createContactMessage } from '../../actions';
import { useScrollToError } from '../../hooks';
import { contactFormSchema } from '../../schemas/schemas';

const ContactForm = ({ user }) => {
  const formRef = useRef(null);
  const { userId, admin } = user;
  const { setUserId, setShowToast, setIsAdmin } = useAppContext();

  // set global context user id and timezone and state timezone
  useEffect(() => {
    setUserId(userId);
    setIsAdmin(admin);
  }, []);

  const [form, setForm] = useState({
    userId,
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

  return (
    <form onSubmit={onSubmit} ref={formRef} className='form-page contact-form'>
      <h1 className='form-page__h2'>Contact</h1>
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
        <CTA
          text='Cancel'
          type='anchor'
          href='/'
          className='cta-button cta-button--small cta-button--orange'
          ariaLabel='Navigate back to dashboard'
        />
        <CTA
          text='Submit'
          btnType='submit'
          className='cta-button cta-button--small cta-button--green'
          ariaLabel='Submit feedback to Saturday'
          showSpinner={isAwaitingContactFormResponse}
        />
      </div>
    </form>
  );
};

export default ContactForm;
