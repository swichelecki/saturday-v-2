import { useState } from 'react';
import { loginUser } from '../../services';
import { useRouter } from 'next/router';
import { RiAlertFill } from 'react-icons/ri';

const DetailsForm = () => {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isAwaitingLogInResponse, setisAwaitingLogInResponse] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!username?.length || !password?.length) {
      setHasError(true);
      setErrorMessage('Username and Password Required');
      return;
    }

    const userObject = {
      username,
      password,
    };

    setisAwaitingLogInResponse(true);

    const response = await loginUser(userObject);
    if (response.status === 200) {
      router.push('/');
    } else if (response.status === 403) {
      setHasError(true);
      setisAwaitingLogInResponse(false);
      setErrorMessage('Incorrect Username or Password');
    } else if (response.status === 500) {
      setHasError(true);
      setisAwaitingLogInResponse(false);
      setErrorMessage('Server Error');
      console.log(`${response.statusText}: ${response.status}`);
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
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            {hasError && (
              <div className='login-form__form-error-message'>
                <RiAlertFill />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>
          <div className='login-form__form-row'>
            <label htmlFor='password'>Password</label>
            <input
              type='password'
              id='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {hasError && (
              <div className='login-form__form-error-message'>
                <RiAlertFill />
                <span>{errorMessage}</span>
              </div>
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

export default DetailsForm;
