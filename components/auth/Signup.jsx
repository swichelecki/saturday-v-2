'use client';

import { useState, useEffect } from 'react';
import { createUserAccount } from '../../actions';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { z } from 'zod';
import { useAppContext } from '../../context';
import { FormTextField, Toast } from '../../components';
import {
  FORM_ERROR_MISSING_EMAIL,
  FORM_ERROR_MISSING_PASSWORD,
  FORM_ERROR_PASSWORD_MISMATCH,
  FORM_ERROR_MISSING_CONFIRM_PASSWORD,
  INVALID_USER_DATA,
  USER_ALREADY_EXISTS,
  FORM_CHARACTER_LIMIT_50,
  FORM_ERROR_INVALID_EMAIL,
} from '../../constants';

const Signup = () => {
  const router = useRouter();

  const { setShowToast } = useAppContext();

  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errorMessage, setErrorMessage] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isAwaitingLogInResponse, setisAwaitingLogInResponse] = useState(false);

  useEffect(() => {
    if (window && typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
  }, []);

  const handleForm = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });

    if (errorMessage[e.target.name]) {
      setErrorMessage({ ...errorMessage, [e.target.name]: '' });
    }
  };

  const CreateUserSchema = z
    .object({
      email: z
        .string()
        .min(1, FORM_ERROR_MISSING_EMAIL)
        .email(FORM_ERROR_INVALID_EMAIL)
        .max(50, FORM_CHARACTER_LIMIT_50),
      password: z
        .string()
        .min(1, FORM_ERROR_MISSING_PASSWORD)
        .max(50, FORM_CHARACTER_LIMIT_50),
      confirmPassword: z
        .string()
        .min(1, FORM_ERROR_MISSING_CONFIRM_PASSWORD)
        .max(50, FORM_CHARACTER_LIMIT_50),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: FORM_ERROR_PASSWORD_MISMATCH,
      path: ['confirmPassword'],
    });

  const onSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const CreateUserSchemaValidated = CreateUserSchema.safeParse({
      email: formData.get('email'),
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword'),
    });

    const { success, error } = CreateUserSchemaValidated;

    if (!success) {
      const { email, password, confirmPassword } = error.flatten().fieldErrors;
      setErrorMessage({
        email: email?.[0],
        password: password?.[0],
        confirmPassword: confirmPassword?.[0],
      });
    } else {
      setisAwaitingLogInResponse(true);

      const response = await createUserAccount(formData);
      if (response.status === 200) {
        router.push('/settings');
      } else if (response.status === 400) {
        setisAwaitingLogInResponse(false);
        setErrorMessage({
          email: INVALID_USER_DATA,
          password: INVALID_USER_DATA,
        });
      } else if (response.status === 409) {
        setisAwaitingLogInResponse(false);
        setErrorMessage({
          email: USER_ALREADY_EXISTS,
          password: USER_ALREADY_EXISTS,
        });
      } else {
        setShowToast(<Toast serverError={response} />);
        setisAwaitingLogInResponse(false);
      }
    }
  };

  return (
    <div className='entry-form__wrapper'>
      <form onSubmit={onSubmit} className='entry-form__form'>
        <div className='entry-form__form-controls-wrapper'>
          <FormTextField
            label='Email'
            type='email novalidate'
            id='email'
            name='email'
            value={form?.email}
            onChangeHandler={handleForm}
            errorMessage={errorMessage.email}
          />
          <FormTextField
            label='Password'
            type='password'
            id='password'
            name='password'
            value={form?.password}
            onChangeHandler={handleForm}
            errorMessage={errorMessage.password}
          />
          <FormTextField
            label='Confirm Password'
            type='password'
            id='confirmPassword'
            name='confirmPassword'
            value={form?.confirmPassword}
            onChangeHandler={handleForm}
            errorMessage={errorMessage.confirmPassword}
          />
          <div className='entry-form__form-row'>
            <button type='submit' className='entry-form__button'>
              {isAwaitingLogInResponse && <div className='loader'></div>}
              Create Account
            </button>
            <Link href='/login'>Log In</Link>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Signup;
