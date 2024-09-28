'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { FormTextField, FormWYSIWYGField, Toast } from './';
import { useAppContext } from '../context';
import { createContactMessage } from '../actions';
import z from 'zod';
import {
  FORM_ERROR_MISSING_EMAIL,
  FORM_ERROR_INVALID_EMAIL,
  FORM_ERROR_MISSING_SUBJECT,
  FORM_ERROR_MISSING_MESSAGE,
  FORM_CHARACTER_LIMIT_50,
  FORM_CHARACTER_LIMIT_1000,
} from '../constants';

const ContactForm = ({ user }) => {
  const formRef = useRef(null);
  const { userId, timezone, admin, email } = user;
  const { setUserId, setShowToast, setTimezone, setIsAdmin } = useAppContext();

  // set global context user id and timezone and state timezone
  useEffect(() => {
    setUserId(userId);
    setTimezone(timezone);
    setIsAdmin(admin);
  }, []);

  const [form, setForm] = useState({
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

  // scroll up to topmost error message
  useEffect(() => {
    if (!scrollToErrorMessage) return;
    const errorArray = Array.from(
      formRef.current.querySelectorAll('.form-field--error')
    );
    const firstErrorNode = errorArray[0];
    window.scrollTo({
      top: firstErrorNode.offsetTop - 24,
      behavior: 'smooth',
    });
    setScrollToErrorMessage(false);
  }, [scrollToErrorMessage]);

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

  const contactFormSchema = z
    .object({
      email: z
        .string()
        .min(1, FORM_ERROR_MISSING_EMAIL)
        .email(FORM_ERROR_INVALID_EMAIL)
        .max(50, FORM_CHARACTER_LIMIT_50),
      subject: z
        .string()
        .min(1, FORM_ERROR_MISSING_SUBJECT)
        .max(50, FORM_CHARACTER_LIMIT_50),
      message: z
        .string()
        .min(1, FORM_ERROR_MISSING_MESSAGE)
        .max(1000, FORM_CHARACTER_LIMIT_1000),
    })
    .refine(
      (data) => data.message?.length > 0 && data.message !== '<p><br></p>',
      {
        message: FORM_ERROR_MISSING_MESSAGE,
        path: ['message'],
      }
    );

  const onSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const contactFormValidated = contactFormSchema.safeParse({
      email: formData.get('email'),
      subject: formData.get('subject'),
      message: formData.get('message'),
    });

    const { success, error } = contactFormValidated;

    if (!success) {
      const { subject, message } = error.flatten().fieldErrors;
      setErrorMessage({
        subject: subject?.[0],
        message: message?.[0],
      });
      setScrollToErrorMessage(true);
    } else {
      setIsAwaitingContactFormResponse(true);

      const response = await createContactMessage(formData);
      if (response.status === 200) {
        setIsAwaitingContactFormResponse(false);
      } else {
        setShowToast(<Toast serverError={response} />);
        setIsAwaitingContactFormResponse(false);
      }
    }
  };

  return (
    <form onSubmit={onSubmit} ref={formRef} className='form-page'>
      <h2 className='form-page__h2'>Contact</h2>
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
        hasToolbar={false}
        value={form?.message}
        onChangeHandler={handleSetQuill}
        errorMessage={errorMessage.message}
      />
      <input type='hidden' name='message' value={form?.message} />
      <input type='hidden' name='email' value={email} />
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
