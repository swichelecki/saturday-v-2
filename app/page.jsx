'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Modal } from '../components';
import { useAppContext } from '../context';
import { useInnerWidth } from '../hooks';
import { ImCheckmark } from 'react-icons/im';
import homepageImage from '../public/saturday-homepage.webp';

export default function Home() {
  const { setShowModal } = useAppContext();

  const width = useInnerWidth();

  // reset image modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setShowModal(null);
    };

    if (document && typeof document !== 'undefined') {
      document.addEventListener('keydown', handleKeyDown);

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, []);

  // show image modal
  const handleShowModal = () => {
    if (width <= 1000) return;

    setShowModal(
      <Modal className='modal modal__image-modal'>
        <Image
          src={homepageImage}
          width={1000}
          height={563}
          quality={100}
          alt='Example of Saturday dashboard'
        />
      </Modal>
    );
  };

  return (
    <div className='homepage__wrapper'>
      <div className='homepage__background-gradiant' />
      <div className='homepage__hero'>
        <div className='homepage__hero-left'>
          <h1>Organize Your Life, Simply</h1>
          <p>
            Saturday is your free, super simple daily organizer. Manage all of
            your everyday tasks and obligations with Saturday’s customizable
            interface designed to simplify your life.
          </p>
          <Link href='/signup' className='homepage__signup'>
            Get Organized Now
          </Link>
        </div>
        <div className='homepage__hero-right'>
          <button onClick={handleShowModal} type='button'>
            <Image
              src={homepageImage}
              width={720}
              height={405}
              sizes='(max-width: 768px) calc(100vw - 48px), 1000px'
              quality={100}
              priority
              alt='Example of Saturday dashboard'
            />
          </button>
        </div>
      </div>
      <div className='homepage__benefits'>
        <h2 className='h1'>Saturday Keeps You on Track</h2>
        <div className='homepage__benefits-wrapper'>
          <div className='homepage__benefit'>
            <h3 className='h2'>
              <ImCheckmark />
              Never Miss a Beat
            </h3>
            <p>
              Whether it’s your weekly grind or reoccurring obligations and
              dates, never lose track of a thing.
            </p>
          </div>
          <div className='homepage__benefit'>
            <h3 className='h2'>
              <ImCheckmark />
              Tailored to You
            </h3>
            <p>
              Set up Saturday’s customizable interface according to your needs.
            </p>
          </div>
          <div className='homepage__benefit'>
            <h3 className='h2'>
              <ImCheckmark />
              Clean & Concise
            </h3>
            <p>
              Conservative character limits force you to say more with less for
              a clean, readable user experience.
            </p>
          </div>
        </div>
      </div>
      <div className='homepage__direct-cta'>
        <h2 className='h1'>Ready for Saturday?</h2>
        <Link href='/signup' className='homepage__signup'>
          Get Organized Now
        </Link>
      </div>
    </div>
  );
}
