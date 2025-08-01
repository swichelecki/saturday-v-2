'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Modal } from '../components';
import { useAppContext } from '../context';
import { useInnerWidth } from '../hooks';
import { ImCheckmark } from 'react-icons/im';
import homepageImage from '../public/saturday-homepage-no-ai-no-prob.webp';

export default function Home() {
  const { setShowModal } = useAppContext();

  const width = useInnerWidth();

  // show image modal
  const handleShowModal = () => {
    if (width <= 1000) return;

    setShowModal(
      <Modal
        className='modal modal__image-modal'
        showCloseButton={false}
        closeModalWhenClickingOutside={true}
      >
        <Image
          src={homepageImage}
          width={1000}
          height={563}
          quality={100}
          alt='Hide the Pain Arnold. No AI. No Problem.'
        />
      </Modal>
    );
  };

  return (
    <div className='homepage__wrapper'>
      <div className='homepage__background-gradiant' />
      <div className='homepage__hero'>
        <div className='homepage__hero-left'>
          <h1>Plan Your Life, Simply</h1>
          <p>
            Saturday is your super simple, no-AI daily planner. Manage all of
            your everyday tasks and obligations with Saturday’s customizable
            interface designed to simplify your life.
          </p>
          <Link href='/signup' className='homepage__signup'>
            Get Started
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
              alt='Hide the Pain Arnold. No AI. No Problem.'
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
              No AI Slop
            </h3>
            <p>
              Escape AI overload while supporting a human-made web application.
            </p>
          </div>
          <div className='homepage__benefit'>
            <h3 className='h2'>
              <ImCheckmark />
              Never Miss a Beat
            </h3>
            <p>
              Whether it’s your weekly grind or recurring tasks and obligations,
              never lose track of a thing.
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
        </div>
      </div>
      <div className='homepage__direct-cta'>
        <h2 className='h1'>Ready for Super Simple Task Management?</h2>
        <Link href='/signup' className='homepage__signup'>
          Get Started
        </Link>
      </div>
    </div>
  );
}
