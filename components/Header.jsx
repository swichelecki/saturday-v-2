import Link from 'next/link';
import Weather from './Weather';
import UserMenu from './UserMenu';

const Header = () => {
  return (
    <header className='header'>
      <div className='header__inner-wrapper'>
        <Link href='/'>
          <h1>Saturday</h1>
        </Link>
        <div className='header__content-right'>
          <Weather />
          <UserMenu />
        </div>
      </div>
    </header>
  );
};

export default Header;
