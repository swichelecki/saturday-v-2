import { useState } from 'react';
import { loginUser } from '../../services';
import { useRouter } from 'next/router';
import { useAppContext } from 'context';
import { FormErrorMessage } from '../../components';
import {
  FORM_ERROR_MISSING_USERNAME_PASSWORD,
  FORM_ERROR_INCORRECT_USERNAME_PASSWORD,
} from 'constants';

const Login = () => {
  const router = useRouter();

  const { setShowToast, setServerError } = useAppContext();

  const [form, setForm] = useState({ username: '', password: '' });
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isAwaitingLogInResponse, setisAwaitingLogInResponse] = useState(false);

  const handleForm = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!form?.username?.length || !form?.password?.length) {
      setHasError(true);
      setErrorMessage(FORM_ERROR_MISSING_USERNAME_PASSWORD);
      return;
    }

    setisAwaitingLogInResponse(true);

    const response = await loginUser(form);
    if (response.status === 200) {
      router.push('/');
    } else if (response.status === 403) {
      setHasError(true);
      setisAwaitingLogInResponse(false);
      setErrorMessage(FORM_ERROR_INCORRECT_USERNAME_PASSWORD);
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
            <label htmlFor='username'>Username</label>
            <input
              type='text'
              id='username'
              name='username'
              value={form?.username}
              onChange={handleForm}
            />
            {hasError && <FormErrorMessage errorMessage={errorMessage} />}
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
            {hasError && <FormErrorMessage errorMessage={errorMessage} />}
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
