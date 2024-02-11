import Head from 'next/head';
import { Header } from './';

// google fonts in pages/_document.js

const Layout = ({ children }) => {
  return (
    <>
      <Head>
        <title>Saturday</title>
        <meta name='robots' content='noindex' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <Header />
      <main className='container'>{children}</main>
    </>
  );
};

export default Layout;
