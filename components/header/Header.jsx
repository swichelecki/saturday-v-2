import Link from 'next/link';
import { Suspense } from 'react';
import UserOptions from './UserOptions';

const Header = () => {
  /* const showUserAlert =
    isMounted &&
    !isAdmin &&
    pathname !== '/' &&
    pathname !== '/login' &&
    pathname !== '/signup' &&
    pathname !== '/reset'; */

  return (
    <>
      {/* {showUserAlert && <UserAlert />} */}
      <header className='header'>
        <div className='header__inner-wrapper'>
          <Link href='/dashboard' prefetch={false} className='h1'>
            Saturday
          </Link>
          <Suspense>
            <UserOptions />
          </Suspense>
        </div>
      </header>
    </>
  );
};

export default Header;
