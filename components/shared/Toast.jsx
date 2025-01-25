'use client';

import { useRef, useEffect } from 'react';
import { useAppContext } from '../../context';
import { MdError, MdOutlineClear } from 'react-icons/md';
import { ImCheckmark } from 'react-icons/im';

const Toast = ({ isSuccess = false, serverError = '', message = '' }) => {
  const { setShowToast } = useAppContext();

  const toastRef = useRef(null);

  useEffect(() => {
    const showToast = setTimeout(() => {
      toastRef.current.classList.add('show-toast');
    }, 100);

    return () => clearTimeout(showToast);
  }, []);

  return (
    <div
      ref={toastRef}
      className={`${
        !isSuccess && serverError
          ? 'toast-message'
          : 'toast-message toast-message--success'
      }`}
    >
      {!isSuccess && serverError ? <MdError /> : <ImCheckmark />}
      <div>
        {!isSuccess && serverError ? (
          <>
            <p>{`${serverError.status} Error`}</p>
            <p>{serverError.error}</p>
          </>
        ) : (
          <p>{message}</p>
        )}
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
