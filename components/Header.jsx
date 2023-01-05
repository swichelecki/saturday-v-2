import Link from 'next/link';
import Weather from './Weather';

const Header = () => {
  return (
    <header className='header'>
      <div className='header__inner-wrapper'>
        <Link href='/'>
          <h1>Saturday</h1>
        </Link>
        <Weather />
      </div>
    </header>
  );
};

export default Header;
