import { Suspense } from 'react';
import { getUserFromCookie } from '../../utilities/getUserFromCookie';
import Weather from './Weather';
import UserMenu from '../../components/header/UserMenu';
import CTA from '../../components/shared/CTA';

const UserOptions = async () => {
  const { userId, admin } = await getUserFromCookie();

  return (
    <div className='header__content-right'>
      {userId ? (
        <>
          <Suspense>
            <Weather />
          </Suspense>
          <UserMenu isAdmin={admin} userId={userId} />
        </>
      ) : (
        <>
          <CTA
            text='Log In'
            type='anchor'
            href='/login'
            className='cta-text-link'
            ariaLabel='Log in to Saturday'
          />
        </>
      )}
    </div>
  );
};

export default UserOptions;
