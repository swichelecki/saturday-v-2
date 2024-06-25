'use client';

import { useState, useEffect } from 'react';
import { loginUser } from '../../actions';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppContext } from '../../context';
import { FormTextField } from '../../components';
import {
  FORM_ERROR_MISSING_EMAIL,
  FORM_ERROR_MISSING_PASSWORD,
  FORM_ERROR_INCORRECT_EMAIL_PASSWORD,
} from '../../constants';

const Login = () => {
  const router = useRouter();

  const { setShowToast, setServerError } = useAppContext();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errorMessage, setErrorMessage] = useState({
    email: '',
    password: '',
  });
  const [isAwaitingLogInResponse, setisAwaitingLogInResponse] = useState(false);

  useEffect(() => {
    if (!errorMessage.email) return;
    setErrorMessage({ ...errorMessage, email: '' });
  }, [form.email]);

  useEffect(() => {
    if (!errorMessage.password) return;
    setErrorMessage({ ...errorMessage, password: '' });
  }, [form.password]);

  const handleForm = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onSubmit = async (formData) => {
    if (!form.email || !form.password) {
      setErrorMessage({
        email: form.email ? '' : FORM_ERROR_MISSING_EMAIL,
        password: form.password ? '' : FORM_ERROR_MISSING_PASSWORD,
      });
      return;
    }

    setisAwaitingLogInResponse(true);

    const response = await loginUser(formData);
    if (response.status === 200) {
      router.push('/');
    } else if (response.status === 403) {
      setisAwaitingLogInResponse(false);
      setErrorMessage({
        email: FORM_ERROR_INCORRECT_EMAIL_PASSWORD,
        password: FORM_ERROR_INCORRECT_EMAIL_PASSWORD,
      });
    } else {
      setServerError(response.status);
      setShowToast(true);
      setisAwaitingLogInResponse(false);
    }
  };

  return (
    <div className='entry-form__wrapper'>
      <form
        action={(formData) => {
          onSubmit(formData);
        }}
        className='entry-form__form'
      >
        <div className='entry-form__form-controls-wrapper'>
          <FormTextField
            label={'Email'}
            type={'email'}
            id={'email'}
            name={'email'}
            value={form?.email}
            onChangeHandler={handleForm}
            errorMessage={errorMessage.email}
          />
          <FormTextField
            label={'Password'}
            type={'password'}
            id={'password'}
            name={'password'}
            value={form?.password}
            onChangeHandler={handleForm}
            errorMessage={errorMessage.password}
          />
          <div className='entry-form__form-row'>
            <button type='submit' className='entry-form__button'>
              {isAwaitingLogInResponse && <div className='loader'></div>}
              Log In
            </button>
            <Link href='/signup'>Sign up</Link>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Login;
