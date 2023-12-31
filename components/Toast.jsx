import { useRef, useEffect } from 'react';
import { useAppContext } from 'context';
import { MdError, MdOutlineClear } from 'react-icons/md';
import { SERVER_ERROR_MESSAGE } from 'constants';

const Toast = () => {
  const toastRef = useRef(null);

  const { serverError, setShowToast } = useAppContext();

  useEffect(() => {
    setTimeout(() => {
      toastRef.current.classList.add('toast-message--show-toast');
    }, 100);
  }, []);

  const handleDeleteToast = () => {
    toastRef.current.remove();
  };

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
          handleDeleteToast;
        }}
      >
        <MdOutlineClear />
      </button>
    </div>
  );
};

export default Toast;
