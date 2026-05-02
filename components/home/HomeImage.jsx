'use client';

import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useAppContext } from '../../context';
import { useInnerWidth } from '../../hooks';

const Modal = dynamic(() => import('../../components/shared/Modal'), {
  ssr: false,
});

const HomeImage = ({ image, alt }) => {
  const { setShowModal } = useAppContext();

  const width = useInnerWidth();

  const saturdayDashboardAltText = 'Screenshot of the Saturday dashboard';

  // show image modal
  const handleShowModal = (image, altText) => {
    if (width <= 1000) return;

    setShowModal(
      <Modal
        className='modal modal__image-modal'
        showCloseButton={false}
        closeModalWhenClickingOutside={true}
      >
        <Image
          src={image}
          width={1000}
          height={563}
          quality={100}
          unoptimized={altText === saturdayDashboardAltText}
          alt={altText}
        />
      </Modal>,
    );
  };

  return (
    <button
      onClick={() => {
        handleShowModal(image, alt);
      }}
      type='button'
    >
      <Image
        src={image}
        width={720}
        height={405}
        sizes='(max-width: 768px) calc(100vw - 48px), 1000px'
        quality={100}
        priority
        alt={alt}
      />
    </button>
  );
};

export default HomeImage;
