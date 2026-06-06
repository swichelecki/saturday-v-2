'use client';

import { useState, useEffect, startTransition } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { request2FactorAuthentication, loginUser } from '../../actions';
import { useAppContext } from '../../context';
import { FormTextField, CTA } from '../../components';
import { loginSchema } from '../../schemas/schemas';
import { FORM_ERROR_INCORRECT_EMAIL_PASSWORD } from '../../constants';

const Toast = dynamic(() => import('../../components/shared/Toast'), {
  ssr: false,
});

const Login = () => {
  const router = useRouter();

  const { setShowToast } = useAppContext();

  const [form, setForm] = useState({
    email: '',
    password: '',
    verification: '',
  });
  const [errorMessage, setErrorMessage] = useState({
    email: '',
    password: '',
    verification: '',
  });
  const [show2FactorAuthField, setShow2FactorAuthField] = useState(false);
  const [isAwaitingLogInResponse, setisAwaitingLogInResponse] = useState(false);

  useEffect(() => {
    if (window && typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
  }, []);

  // when 6-digit 2-factor authentication code added to form log in user
  useEffect(() => {
    if (form.verification.length >= 6) {
      const zodValidationResults = loginSchema.safeParse(form);
      const { data: zodFormData, success, error } = zodValidationResults;
      if (!success) {
        const { verification } = error.flatten().fieldErrors;
        startTransition(() => {
          setErrorMessage({ verification: verification?.[0] });
        });
        return;
      }

      startTransition(() => {
        setisAwaitingLogInResponse(true);
      });

      loginUser(zodFormData).then((res) => {
        if (res.status === 200) {
          router.push('/dashboard');
        } else if (res.status === 403 || res.status === 410) {
          setisAwaitingLogInResponse(false);
          setErrorMessage({
            verification: res.error,
          });
        } else {
          setShowToast(<Toast serverError={response} />);
          setisAwaitingLogInResponse(false);
        }
      });
    }
  }, [form.verification]);

  const handleForm = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });

    if (errorMessage[e.target.name]) {
      setErrorMessage({ ...errorMessage, [e.target.name]: '' });
    }
  };

  // send user 2-factor authentication code in email on Log In button click
  const onSubmit = async (e) => {
    e.preventDefault();

    const zodValidationResults = loginSchema.safeParse(form);
    const { data: zodFormData, success, error } = zodValidationResults;
    if (!success) {
      const { email, password } = error.flatten().fieldErrors;
      return setErrorMessage({ email: email?.[0], password: password?.[0] });
    }

    setisAwaitingLogInResponse(true);
    const response = await request2FactorAuthentication(zodFormData);
    if (response.status === 200) {
      // if user has opted out of 2FA skip creating code and sending email
      if (!response.enable2FA) {
        const response = await loginUser(zodFormData);
        if (response.status === 200) {
          router.push('/dashboard');
        } else if (response.status === 403 || response.status === 410) {
          setisAwaitingLogInResponse(false);
          setErrorMessage({
            verification: response.error,
          });
        } else {
          setShowToast(<Toast serverError={response} />);
          setisAwaitingLogInResponse(false);
        }
      }

      // handle 2FA
      if (response.enable2FA) {
        setShow2FactorAuthField(true);
        setisAwaitingLogInResponse(false);
      }
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
  };

  return (
    <form onSubmit={onSubmit} className='entry-form__form'>
      {!show2FactorAuthField && (
        <>
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
        </>
      )}
      {show2FactorAuthField && (
        <FormTextField
          label='Verification Code'
          subLabel='Check your email and enter 6-digit verification code'
          type='text'
          id='verification'
          name='verification'
          value={form?.verification}
          onChangeHandler={handleForm}
          errorMessage={errorMessage.verification}
          showSpinner={isAwaitingLogInResponse}
        />
      )}
      <div className='entry-form__form-row'>
        {!show2FactorAuthField && (
          <CTA
            text='Log In'
            className='cta-button cta-button--large cta-button--full cta-button--purple'
            ariaLabel='Log in to Saturday'
            btnType='submit'
            showSpinner={isAwaitingLogInResponse}
          />
        )}
        <CTA
          text='Sign Up'
          type='anchor'
          href='/signup'
          className='cta-text-link'
          ariaLabel='Sign up for Saturday'
        />
        <CTA
          text='Forgot Password'
          type='anchor'
          href='/reset'
          className='cta-text-link'
          ariaLabel='Reset password'
        />
      </div>
    </form>
  );
};

export default Login;
