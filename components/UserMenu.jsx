'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppContext } from 'context';
import { deleteCookie } from 'cookies-next';
import { FaUser } from 'react-icons/fa';
import {
  MdOutlineLogout,
  MdHome,
  MdManageAccounts,
  MdSettings,
} from 'react-icons/md';

const UserMenu = () => {
  const menuRef = useRef(null);

  const router = useRouter();

  const { userId, setUserId } = useAppContext();

  // close menu when clicking off of it or on it
  useEffect(() => {
    const handleCloseMenuWhenClickingOff = (e) => {
      if (!e.target.classList.contains('user-menu__button')) {
        menuRef?.current?.classList.remove('user-menu__nav--show-menu');
      }
    };

    if (document && typeof document !== 'undefined') {
      document.addEventListener('click', (e) =>
        handleCloseMenuWhenClickingOff(e)
      );

      return () => {
        document.removeEventListener('click', (e) =>
          handleCloseMenuWhenClickingOff(e)
        );
      };
    }
  }, []);

  // show / hide menu
  const handleUserMenu = () => {
    menuRef.current.classList.toggle('user-menu__nav--show-menu');
  };

  // log out
  const handleUserLogOut = () => {
    deleteCookie('saturday');
    setUserId(null);
    router.push('/login');
  };

  if (!userId) {
    return <></>;
  }

  return (
    <>
      <button
        onClick={handleUserMenu}
        className='user-menu__button'
        title='User Profile'
      >
        <FaUser />
      </button>
      <nav ref={menuRef} className={'user-menu__nav'}>
        <ul>
          <li>
            <Link href='/settings'>
              <MdSettings />
              Settings
            </Link>
          </li>
          <li>
            <Link href='/account'>
              <MdManageAccounts />
              Account
            </Link>
          </li>
          <li>
            <Link href='/'>
              <MdHome />
              Home
            </Link>
          </li>
          <li>
            <div role='button' onClick={handleUserLogOut} tabIndex='0'>
              <MdOutlineLogout />
              Log Out
            </div>
          </li>
        </ul>
      </nav>
    </>
  );
};

export default UserMenu;
