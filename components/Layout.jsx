'use client';

import { useAppContext } from '../context';

const Layout = ({ children }) => {
  const { modal, toast } = useAppContext();

  return (
    <>
      <main className='container'>{children}</main>
      {modal && modal}
      {toast && toast}
    </>
  );
};

export default Layout;
