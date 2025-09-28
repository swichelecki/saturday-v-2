'use client';

import Image from 'next/image';
import { Modal, CTA } from '../components';
import { useAppContext } from '../context';
import { useInnerWidth } from '../hooks';
import { ImCheckmark } from 'react-icons/im';
import homepageImage from '../public/saturday-homepage-no-ai-no-prob.webp';
import saturdayDashboard from '../public/saturday-dashboard.webp';

export default function Home() {
  const { setShowModal } = useAppContext();

  const width = useInnerWidth();

  const hideThePainArnoldAltText = 'Hide the Pain Arnold. No AI. No Problem.';
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
          alt={altText}
        />
      </Modal>
    );
  };

  return (
    <div className='homepage__wrapper'>
      <div className='homepage__background-gradiant' />
      <section className='homepage__hero'>
        <div className='homepage__hero-left'>
          <h1>Plan Your Life, Simply</h1>
          <p>
            Saturday is your super simple, no-AI daily planner. Manage all of
            your everyday tasks and obligations with Saturday’s customizable
            interface designed to simplify your life.
          </p>
          <CTA
            text='Get Started'
            type='anchor'
            href='/signup'
            className='cta-button cta-button--medium cta-button--purple'
            ariaLabel='Sign up for Saturday'
          />
        </div>
        <div className='homepage__hero-right'>
          <button
            onClick={() => {
              handleShowModal(homepageImage, hideThePainArnoldAltText);
            }}
            type='button'
          >
            <Image
              src={homepageImage}
              width={720}
              height={405}
              sizes='(max-width: 768px) calc(100vw - 48px), 1000px'
              quality={100}
              priority
              alt={hideThePainArnoldAltText}
            />
          </button>
        </div>
      </section>
      <section className='homepage__benefits'>
        <h2 className='h1'>Saturday Keeps You on Track</h2>
        <div className='homepage__benefits-wrapper'>
          <div className='homepage__benefit'>
            <h3>No AI Slop</h3>
            <p>
              Escape AI overload while supporting a human-made web application.
            </p>
          </div>
          <div className='homepage__benefit'>
            <h3>Never Miss a Beat</h3>
            <p>
              Whether it’s your weekly grind or recurring tasks and obligations,
              never lose track of a thing.
            </p>
          </div>
          <div className='homepage__benefit'>
            <h3>Tailored to You</h3>
            <p>
              Set up Saturday’s customizable interface according to your needs.
            </p>
          </div>
        </div>
      </section>
      <section className='homepage__features'>
        <div className='homepage__features-image'>
          <button
            onClick={() => {
              handleShowModal(saturdayDashboard, saturdayDashboardAltText);
            }}
            type='button'
          >
            <Image
              src={saturdayDashboard}
              width={720}
              height={405}
              sizes='(max-width: 768px) calc(100vw - 48px), 1000px'
              quality={100}
              alt={saturdayDashboardAltText}
            />
          </button>
        </div>
        <div className='homepage__features-list'>
          <ul>
            <li>
              <ImCheckmark />
              Weekly calendar keeps track of your important events and
              obligations.
            </li>
            <li>
              <ImCheckmark />
              Recurring reminders won’t let you forget to pay that bill or a
              loved one’s birthday.
            </li>
            <li>
              <ImCheckmark />
              Dashboard items can be simple todos or detailed with rich content
              for precise task management.
            </li>
            <li>
              <ImCheckmark />
              Notes let you store longterm information in one convenient place.
            </li>
            <li>
              <ImCheckmark />
              Interface customization means Saturday is tailored to your unique
              daily planning needs.
            </li>
            <li>
              <ImCheckmark />
              Get started with a generous free tier or subscribe via Stripe for
              only $1 a month.
            </li>
          </ul>
        </div>
      </section>
      <section className='homepage__direct-cta'>
        <h2 className='h1'>Ready for Super Simple Task Management?</h2>
        <CTA
          text='Get Started'
          type='anchor'
          href='/signup'
          className='cta-button cta-button--medium cta-button--purple'
          ariaLabel='Sign up for Saturday'
        />
      </section>
    </div>
  );
}
