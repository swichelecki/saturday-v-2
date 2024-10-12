import Link from 'next/link';
import Image from 'next/image';
import { ImCheckmark } from 'react-icons/im';
// real image should live in ../public
//import homepageImage from '../public/favicon.ico';

export default function Home() {
  return (
    <div className='homepage__wrapper'>
      <div className='homepage__background-gradiant' />
      <div className='homepage__hero'>
        <div className='homepage__hero-left'>
          <h1>Organize Your Life, Simply</h1>
          <p>
            Saturday is your place for super simple life management. Organize
            the everyday with Saturday’s customizable interface designed to keep
            you concise and on point.
          </p>
          <Link href='/signup' className='homepage__signup'>
            Get Organized Now
          </Link>
        </div>
        <div className='homepage__hero-right'>
          <Image
            // TODO: remove dummyimage.com domain from next.config.js
            src='https://dummyimage.com/794x447/1d2125/fff.jpg'
            //src={homepageImage}
            width={794}
            height={447}
            sizes='(max-width: 768px) calc(100vw - 48px), 1200px'
            quality={100}
            priority
            alt='Example of Saturday dashboard'
            className='homepage__grid-item--hero'
          />
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
              Whether it’s your weekly grind or reoccurring events and dates,
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
        <h2 className='h1'>Ready for Super Simple Life Management?</h2>
        <Link href='/signup' className='homepage__signup'>
          Get Organized Now
        </Link>
      </div>
    </div>
  );
}
