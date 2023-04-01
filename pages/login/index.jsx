import { useState } from 'react';
import { loginUser } from '../../services';
import { useRouter } from 'next/router';

const DetailsForm = () => {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

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
    }
  };

  return (
    <form onSubmit={onSubmit} className='details-form'>
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
