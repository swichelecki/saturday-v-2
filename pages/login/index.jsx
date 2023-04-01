import { useState } from 'react';
import { loginUser } from '../../services';
import { useRouter } from 'next/router';

const DetailsForm = () => {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!username && password) {
      return;
    }

    const userObject = {
      username,
      password,
    };

    const response = await loginUser(userObject);
    if (response.status === 200) {
      router.push('/');
    } else if (response.status === 403) {
      setHasError(true);
      setErrorMessage('Incorrect Username or Password');
    } else if (response.status === 500) {
      setHasError(true);
      setErrorMessage('Server Error');
      console.log(`${response.statusText}: ${response.status}`);
    }
  };

  return (
    <form onSubmit={onSubmit} className='details-form'>
      {hasError && <p>{errorMessage}</p>}
      <div className='details-form__form-row'>
        <label htmlFor='username'>Username</label>
        <input
          type='text'
          id='username'
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div className='details-form__form-row'>
        <label htmlFor='password'>Password</label>
        <input
          type='password'
          id='password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div className='details-form__buttons-wrapper'>
        <button type='submit' className='details-form__save-button'>
          Log In
        </button>
      </div>
    </form>
  );
};

export default DetailsForm;
