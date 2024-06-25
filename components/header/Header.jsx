import Link from 'next/link';
import dynamic from 'next/dynamic';

const Weather = dynamic(() => import('../../components/header/Weather'));
const UserMenu = dynamic(() => import('../../components/header/UserMenu'));

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
