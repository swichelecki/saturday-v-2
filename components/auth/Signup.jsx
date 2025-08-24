'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createUserAccount } from '../../actions';
import { useAppContext } from '../../context';
import { FormTextField, Toast, CTA } from '../../components';
import { createUserSchema } from '../../schemas/schemas';
import { USER_ALREADY_EXISTS } from '../../constants';

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

  const onSubmit = async (e) => {
    e.preventDefault();

    const zodValidationResults = createUserSchema.safeParse(form);
    const { data: zodFormData, success, error } = zodValidationResults;
    if (!success) {
      const { email, password, confirmPassword } = error.flatten().fieldErrors;
      return setErrorMessage({
        email: email?.[0],
        password: password?.[0],
        confirmPassword: confirmPassword?.[0],
      });
    }

    setisAwaitingLogInResponse(true);
    const response = await createUserAccount(zodFormData);
    if (response.status === 200) {
      router.push('/settings');
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
        <CTA
          text='Create Account'
          className='cta-button cta-button--large cta-button--full cta-button--purple'
          ariaLabel='Create your Saturday account'
          btnType='submit'
          showSpinner={isAwaitingLogInResponse}
        />
        <CTA
          text='Log In'
          type='anchor'
          href='/login'
          className='cta-text-link'
          ariaLabel='Log in to Saturday'
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

export default Signup;
