'use client';

import { useAppContext } from '../context';
import { Header } from '../components';

const Layout = ({ children }) => {
  const { modal, toast } = useAppContext();

  return (
    <>
      <Header />
      <main className='container'>{children}</main>
      {modal && modal}
      {toast && toast}
    </>
  );
};

export default Layout;
