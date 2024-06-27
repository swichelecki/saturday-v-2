'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useAppContext } from '../../context';

const Weather = dynamic(() => import('../../components/header/Weather'));
const UserMenu = dynamic(() => import('../../components/header/UserMenu'));

const Header = () => {
  const { userId } = useAppContext();

  return (
    <header className='header'>
      <div className='header__inner-wrapper'>
        <Link href='/dashboard'>
          <h1>Saturday</h1>
        </Link>
        <div className='header__content-right'>
          {userId ? (
            <>
              <Weather />
              <UserMenu />
            </>
          ) : (
            <Link href='/login'>Log In</Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
