'use client';

import { useState, useEffect } from 'react';
import { createUserAccount } from '../../actions';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppContext } from '../../context';
import { FormTextField, Toast } from '../../components';
import {
  FORM_ERROR_MISSING_EMAIL,
  FORM_ERROR_MISSING_PASSWORD,
  FORM_ERROR_PASSWORD_MISMATCH,
  FORM_ERROR_MISSING_CONFIRM_PASSWORD,
  INVALID_USER_DATA,
  USER_ALREADY_EXISTS,
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

  useEffect(() => {
    if (!errorMessage.email) return;
    setErrorMessage({ ...errorMessage, email: '' });
  }, [form.email]);

  useEffect(() => {
    if (!errorMessage.password) return;
    setErrorMessage({ ...errorMessage, password: '' });
  }, [form.password]);

  useEffect(() => {
    if (!errorMessage.confirmPassword) return;
    setErrorMessage({ ...errorMessage, confirmPassword: '' });
  }, [form.confirmPassword]);

  const handleForm = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    if (!form.email || !form.password || !form.confirmPassword) {
      setErrorMessage({
        email: form.email ? '' : FORM_ERROR_MISSING_EMAIL,
        password: form.password ? '' : FORM_ERROR_MISSING_PASSWORD,
        confirmPassword: form.confirmPassword
          ? ''
          : FORM_ERROR_MISSING_CONFIRM_PASSWORD,
      });
      return;
    }

    if (form.password !== form.confirmPassword) {
      setErrorMessage({
        password: FORM_ERROR_PASSWORD_MISMATCH,
        confirmPassword: FORM_ERROR_PASSWORD_MISMATCH,
      });
      return;
    }

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
  };

  return (
    <div className='entry-form__wrapper'>
      <form onSubmit={onSubmit} className='entry-form__form'>
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
          <FormTextField
            label={'Confirm Password'}
            type={'password'}
            id={'confirmPassword'}
            name={'confirmPassword'}
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
