'use client';

import { useRef, useEffect } from 'react';
import { useAppContext } from '../context';
import { MdError, MdOutlineClear } from 'react-icons/md';

const Toast = ({ serverError }) => {
  const { setShowToast } = useAppContext();

  const toastRef = useRef(null);

  useEffect(() => {
    setTimeout(() => {
      toastRef.current.classList.add('toast-message--show-toast');
    }, 100);
  }, []);

  return (
    <div ref={toastRef} className='toast-message'>
      <MdError />
      <div>
        <p>{`${serverError.status} Error`}</p>
        <p>{serverError.error}</p>
      </div>
      <button
        onClick={() => {
          setShowToast(null);
        }}
      >
        <MdOutlineClear />
      </button>
    </div>
  );
};

export default Toast;
