'use client';

import { useEffect, useRef } from 'react';
import { useAppContext } from '../context';
import { useInnerHeight } from '../hooks';
import { handleModalResetPageScrolling } from '../utilities';
import { IoClose } from 'react-icons/io5';

const Modal = ({ className, children, showCloseButton = true }) => {
  const modalRef = useRef(null);

  const innerHeight = useInnerHeight();

  const { setShowModal } = useAppContext();

  useEffect(() => {
    modalRef.current.showModal();
    window.scrollTo(0, 0);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') handleCloseModal();
    };

    /* const handleCloseModalWhenClickingOff = (e) => {
      if (e.target === modalRef.current) handleCloseModal();
    }; */

    if (document && typeof document !== 'undefined') {
      document.addEventListener('keydown', handleKeyDown);
      //document.addEventListener('click', handleCloseModalWhenClickingOff);

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        //document.removeEventListener('click', handleCloseModalWhenClickingOff);
      };
    }
  }, []);

  useEffect(() => {
    const modalHeight = modalRef?.current?.offsetHeight;
    const appWrapper = document.querySelector('.app-wrapper');

    // when modal is taller than viewport limit scrolling to height of modal
    if (innerHeight && modalHeight >= innerHeight) {
      const pageScrollingRestrictedHeight = modalHeight + 32;
      appWrapper.setAttribute(
        'style',
        `height: ${pageScrollingRestrictedHeight}px; overflow: hidden;`
      );
    }

    // when modal is shorter than viewport prevent scrolling
    if (innerHeight && modalHeight < innerHeight) {
      appWrapper.setAttribute(
        'style',
        `height: ${innerHeight}px; overflow: hidden;`
      );
    }
  }, [innerHeight]);

  const handleCloseModal = () => {
    setShowModal(null);
    handleModalResetPageScrolling();
  };

  return (
    <dialog ref={modalRef} className={`${className ? className : 'modal'}`}>
      <div className='modal__inner-wrapper'>
        {showCloseButton && (
          <button onClick={handleCloseModal} type='button'>
            <IoClose />
          </button>
        )}
        {children}
      </div>
    </dialog>
  );
};

export default Modal;
