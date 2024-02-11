import { useRef, useEffect } from 'react';
import { MdError, MdOutlineClear } from 'react-icons/md';
import { SERVER_ERROR_MESSAGE } from 'constants';

const Toast = ({ serverError, setShowToast }) => {
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
        <p>{`${serverError} Error`}</p>
        <p>{SERVER_ERROR_MESSAGE}</p>
      </div>
      <button
        onClick={() => {
          setShowToast(false);
        }}
      >
        <MdOutlineClear />
      </button>
    </div>
  );
};

export default Toast;
