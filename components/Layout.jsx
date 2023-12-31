import Head from 'next/head';
import { useAppContext } from 'context';
import { Header } from './';
import { Toast } from './';

// google fonts in pages/_document.js

const Layout = ({ children }) => {
  const { showToast } = useAppContext();

  return (
    <>
      <Head>
        <title>Saturday</title>
        <meta name='robots' content='noindex' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <Header />
      <main className='container'>{children}</main>
      {showToast && <Toast />}
    </>
  );
};

export default Layout;
