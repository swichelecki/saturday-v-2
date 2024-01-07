import { useState, useEffect } from 'react';
import { loginUser } from '../../services';
import { useRouter } from 'next/router';
import { useAppContext } from 'context';
import { FormErrorMessage } from '../../components';
import {
  FORM_ERROR_MISSING_EMAIL,
  FORM_ERROR_MISSING_PASSWORD,
  FORM_ERROR_INCORRECT_EMAIL_PASSWORD,
} from 'constants';

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

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      setErrorMessage({
        email: form.email ? '' : FORM_ERROR_MISSING_EMAIL,
        password: form.password ? '' : FORM_ERROR_MISSING_PASSWORD,
      });
      return;
    }

    setisAwaitingLogInResponse(true);

    const response = await loginUser(form);
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
    <section className='login-form__wrapper'>
      <form onSubmit={onSubmit} className='login-form__form'>
        <div className='login-form__form-controls-wrapper'>
          <div className='login-form__form-row'>
            <label htmlFor='email'>Email</label>
            <input
              type='email'
              id='email'
              name='email'
              value={form?.email}
              onChange={handleForm}
            />
            {errorMessage.email && (
              <FormErrorMessage errorMessage={errorMessage.email} />
            )}
          </div>
          <div className='login-form__form-row'>
            <label htmlFor='password'>Password</label>
            <input
              type='password'
              id='password'
              name='password'
              value={form?.password}
              onChange={handleForm}
            />
            {errorMessage.password && (
              <FormErrorMessage errorMessage={errorMessage.password} />
            )}
          </div>
          <div className='login-form__form-row'>
            <button type='submit' className='login-form__login-button'>
              {isAwaitingLogInResponse && <div className='loader'></div>}
              Log In
            </button>
          </div>
        </div>
      </form>
    </section>
  );
};

export default Login;
