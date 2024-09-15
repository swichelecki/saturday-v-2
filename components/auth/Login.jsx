'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { z } from 'zod';
import { loginUser } from '../../actions';
import { useAppContext } from '../../context';
import { FormTextField, Toast } from '../../components';
import {
  FORM_ERROR_MISSING_EMAIL,
  FORM_ERROR_MISSING_PASSWORD,
  FORM_ERROR_INCORRECT_EMAIL_PASSWORD,
  FORM_CHARACTER_LIMIT_50,
  FORM_ERROR_INVALID_EMAIL,
} from '../../constants';

const Login = () => {
  const router = useRouter();

  const { setShowToast } = useAppContext();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errorMessage, setErrorMessage] = useState({
    email: '',
    password: '',
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

  const loginSchema = z.object({
    email: z
      .string()
      .min(1, FORM_ERROR_MISSING_EMAIL)
      .email(FORM_ERROR_INVALID_EMAIL)
      .max(50, FORM_CHARACTER_LIMIT_50),
    password: z
      .string()
      .min(1, FORM_ERROR_MISSING_PASSWORD)
      .max(50, FORM_CHARACTER_LIMIT_50),
  });

  const onSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const loginDataValidated = loginSchema.safeParse({
      email: formData.get('email'),
      password: formData.get('password'),
    });

    const { success, error } = loginDataValidated;

    if (!success) {
      const { email, password } = error.flatten().fieldErrors;
      setErrorMessage({ email: email?.[0], password: password?.[0] });
    } else {
      setisAwaitingLogInResponse(true);

      const response = await loginUser(formData);
      if (response.status === 200) {
        router.push('/dashboard');
      } else if (response.status === 403) {
        setisAwaitingLogInResponse(false);
        setErrorMessage({
          email: FORM_ERROR_INCORRECT_EMAIL_PASSWORD,
          password: FORM_ERROR_INCORRECT_EMAIL_PASSWORD,
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
          <div className='entry-form__form-row'>
            <button type='submit' className='entry-form__button'>
              {isAwaitingLogInResponse && <div className='loader'></div>}
              Log In
            </button>
            <Link href='/signup'>Sign Up</Link>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Login;
