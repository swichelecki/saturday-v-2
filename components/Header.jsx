import { useAppContext } from 'context';
import Link from 'next/link';
import Weather from './Weather';
import UserMenu from './UserMenu';

const Header = () => {
  const { userId } = useAppContext();

  return (
    <header className='header'>
      <div className='header__inner-wrapper'>
        <Link href='/'>
          <h1>Saturday</h1>
        </Link>
        <Weather />
        {userId && <UserMenu />}
      </div>
    </header>
  );
};

export default Header;
