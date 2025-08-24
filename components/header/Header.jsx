'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
//import { useIsMounted } from '../../hooks';
import { useAppContext } from '../../context';

const Weather = dynamic(() => import('../../components/header/Weather'));
const UserMenu = dynamic(() => import('../../components/header/UserMenu'));
const CTA = dynamic(() => import('../../components/shared/CTA'));
//const UserAlert = dynamic(() => import('../../components/header/UserAlert'));

const Header = () => {
  //const isMounted = useIsMounted();
  const { userId } = useAppContext();
  const pathname = usePathname();

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
          <div className='header__content-right'>
            {userId ? (
              <>
                <Weather />
                <UserMenu />
              </>
            ) : pathname === '/' ? (
              <>
                <CTA
                  text='Log In'
                  type='anchor'
                  href='/login'
                  className='cta-text-link'
                  ariaLabel='Log in to Saturday'
                />
              </>
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
