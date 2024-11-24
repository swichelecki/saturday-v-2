'use client';

import { useAppContext } from '../context';
import { Header } from '../components';

const Layout = ({ children }) => {
  const { modal, toast } = useAppContext();

  return (
    <div className='app-wrapper'>
      <Header />
      <main className='container'>{children}</main>
      {modal && modal}
      {toast && toast}
    </div>
  );
};

export default Layout;
