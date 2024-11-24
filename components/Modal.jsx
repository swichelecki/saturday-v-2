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
  }, []);

  // when modal is taller than viewport limit scrolling to height of modal
  useEffect(() => {
    const modalHeight = modalRef?.current?.offsetHeight;

    if (innerHeight && modalHeight > innerHeight) {
      const appWrapper = document.querySelector('.app-wrapper');
      const pageScrollingRestrictedHeight = modalHeight + 32;
      appWrapper.setAttribute(
        'style',
        `height: ${pageScrollingRestrictedHeight}px; overflow: hidden;`
      );
    }
  }, [innerHeight]);

  return (
    <dialog ref={modalRef} className={`${className ? className : 'modal'}`}>
      {showCloseButton && (
        <button
          onClick={() => {
            setShowModal(null);
            handleModalResetPageScrolling();
          }}
          type='button'
        >
          <IoClose />
        </button>
      )}
      {children}
    </dialog>
  );
};

export default Modal;
