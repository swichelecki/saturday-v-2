import { Header } from './';

const Layout = ({ children }) => {
  return (
    <>
      <Header />
      <main className='container'>{children}</main>
    </>
  );
};

export default Layout;
