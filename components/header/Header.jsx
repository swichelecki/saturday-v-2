'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { useAppContext } from '../../context';

const Weather = dynamic(() => import('../../components/header/Weather'));
const UserMenu = dynamic(() => import('../../components/header/UserMenu'));
const UserAlert = dynamic(() => import('../../components/header/UserAlert'));

const Header = () => {
  const { userId, isAdmin } = useAppContext();
  const pathname = usePathname();

  return (
    <>
      {!isAdmin && <UserAlert />}
      <header className='header'>
        <div className='header__inner-wrapper'>
          <Link href='/dashboard' className='h1'>
            Saturday
          </Link>
          <div className='header__content-right'>
            {userId ? (
              <>
                <Weather />
                <UserMenu />
              </>
            ) : pathname === '/' ? (
              <Link href='/login' className=''>
                Log In
              </Link>
            ) : (
              ''
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
