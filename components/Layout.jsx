import Head from 'next/head';
import { Header } from './';

const Layout = ({ children }) => {
  return (
    <>
      <Head>
        <title>Saturday</title>
        <meta name='robots' content='noindex' />
        <link rel='icon' href='/favicon.ico' />
        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link
          rel='preconnect'
          href='https://fonts.gstatic.com'
          crossOrigin='true'
        />
        <link
          href='https://fonts.googleapis.com/css2?family=Montserrat&family=Source+Sans+Pro:wght@300;400&display=swap'
          rel='stylesheet'
        />
      </Head>
      <Header />
      <div className='container'>{children}</div>
    </>
  );
};

export default Layout;
