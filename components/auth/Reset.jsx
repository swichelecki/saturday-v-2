'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { requestUserPasswordReset, resetUserPassword } from '../../actions';
import { useAppContext } from '../../context';
import { FormTextField, Toast } from '../../components';
import {
  requestPasswordResetSchema,
  resetPasswordSchema,
} from '../../schemas/schemas';
import { FORM_ERROR_USER_NOT_FOUND } from '../../constants';

const ResetForm = () => {
  const router = useRouter();
  const params = useSearchParams();
  const [userId] = params.values();
  const isResetPassword = !!userId;

  const { setShowToast } = useAppContext();

  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    userId: userId ?? '',
  });
  const [errorMessage, setErrorMessage] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isAwaitingResponse, setisAwaitingResponse] = useState(false);

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

  const onSubmit = async (e) => {
    e.preventDefault();

    const zodSchema = isResetPassword
      ? resetPasswordSchema
      : requestPasswordResetSchema;

    const zodValidationResults = zodSchema.safeParse(form);
    const { data: zodFormData, success, error } = zodValidationResults;
    if (!success && isResetPassword) {
      const { email, password, confirmPassword } = error.flatten().fieldErrors;

      if (!email && !password && !confirmPassword) {
        const serverError = {
          status: 400,
          error: 'Zod validation failed. Check console.',
        };
        setShowToast(<Toast serverError={serverError} />);
        console.error(error);
        return;
      }

      return setErrorMessage({
        email: email?.[0],
        password: password?.[0],
        confirmPassword: confirmPassword?.[0],
      });
    }

    if (!success && !isResetPassword) {
      const { email } = error.flatten().fieldErrors;
      return setErrorMessage({
        email: email?.[0],
      });
    }

    setisAwaitingResponse(true);
    isResetPassword
      ? resetUserPassword(zodFormData).then((res) => {
          if (res.status === 200) {
            router.push('/login');
          }

          if (res.status === 404) {
            setErrorMessage({
              email: FORM_ERROR_USER_NOT_FOUND,
            });
            setisAwaitingResponse(false);
          }

          if (res.status !== 200 && res.status !== 404) {
            setShowToast(<Toast serverError={res} />);
            setisAwaitingResponse(false);
          }
        })
      : requestUserPasswordReset(zodFormData).then((res) => {
          if (res.status === 200) {
            setShowToast(
              <Toast isSuccess message='Check your email to reset password.' />
            );
            setisAwaitingResponse(false);
          }

          if (res.status === 404) {
            setErrorMessage({
              email: FORM_ERROR_USER_NOT_FOUND,
            });
            setisAwaitingResponse(false);
          }

          if (res.status !== 200 && res.status !== 404) {
            setShowToast(<Toast serverError={res} />);
            setisAwaitingResponse(false);
          }
        });
  };

  return (
    <form onSubmit={onSubmit} className='entry-form__form'>
      <FormTextField
        label='Email'
        type='email novalidate'
        id='email'
        name='email'
        value={form?.email}
        onChangeHandler={handleForm}
        errorMessage={errorMessage.email}
      />
      {isResetPassword && (
        <>
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
        </>
      )}
      <div className='entry-form__form-row'>
        <button type='submit' className='entry-form__button'>
          {isAwaitingResponse && <div className='loader'></div>}
          {isResetPassword ? 'Create New Password' : 'Request Password Reset'}
        </button>
        <Link href='/login'>Log In</Link>
        <Link href='/signup'>Sign Up</Link>
      </div>
    </form>
  );
};

// have to wrap form in suspense boundry because it is a static page using useSearchParams
const Reset = () => {
  return (
    <Suspense>
      <ResetForm />
    </Suspense>
  );
};

export default Reset;
