import Link from 'next/link';
import Image from 'next/image';
//import homepageImage from '../public/favicon.ico';

export default function Home() {
  return (
    <>
      <div className='homepage__wrapper'>
        <Link
          href='/signup'
          className='main-controls__type-button main-controls__type-button--active'
        >
          Sign Up
        </Link>
        <div className='homepage__top-content-wrapper'>
          <h1>Lorem ipsum dolor sit amet</h1>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
            culpa qui officia deserunt mollit anim id est laborum.
          </p>
        </div>
        <div className='homepage__grid-wrapper'>
          <div className='homepage__grid-item--item-one'>
            <h2>Lorem ipsum dolor sit amet</h2>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            {/*   <Image
              // TODO: remove dummyimage.com domain from next.config.js
              src='https://dummyimage.com/352x198/1d2125/fff.jpg'
              //src={homepageImage}
              width={352}
              height={198}
              sizes='(max-width: 768px) calc(100vw - 48px), 1200px'
              quality={100}
              priority
              alt='Example of Saturday dashboard'
            /> */}
          </div>
          <div className='homepage__grid-item--item-two'>
            <h2>Lorem ipsum dolor sit amet</h2>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            {/* <Image
              // TODO: remove dummyimage.com domain from next.config.js
              src='https://dummyimage.com/352x198/1d2125/fff.jpg'
              //src={homepageImage}
              width={352}
              height={198}
              sizes='(max-width: 768px) calc(100vw - 48px), 1200px'
              quality={100}
              priority
              alt='Example of Saturday dashboard'
            /> */}
          </div>
          <div className='homepage__grid-item--item-three'>
            <h2>Lorem ipsum dolor sit amet</h2>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
            {/*   <Image
              // TODO: remove dummyimage.com domain from next.config.js
              src='https://dummyimage.com/352x198/1d2125/fff.jpg'
              //src={homepageImage}
              width={352}
              height={198}
              sizes='(max-width: 768px) calc(100vw - 48px), 1200px'
              quality={100}
              priority
              alt='Example of Saturday dashboard'
            /> */}
          </div>
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
          <div className='homepage__grid-item--item-small-one'>
            <h2>Lorem ipsum dolor sit amet</h2>
            <ul>
              <li>Excepteur sint occaecat cupidatat non proident</li>
              <li>Excepteur sint occaecat cupidatat non proident</li>
              <li>Excepteur sint occaecat cupidatat non proident</li>
              <li>Excepteur sint occaecat cupidatat non proident</li>
              <li>Excepteur sint occaecat cupidatat non proident</li>
              <li>Excepteur sint occaecat cupidatat non proident</li>
            </ul>
          </div>
        </div>
        <div className='homepage__bottom-content-wrapper'>
          <h2>Lorem ipsum dolor sit amet</h2>
          <Link
            href='/signup'
            className='main-controls__type-button main-controls__type-button--active'
          >
            Sign Up
          </Link>
        </div>
      </div>
      <div className='homepage__background-gradiant' />
    </>
  );
}
