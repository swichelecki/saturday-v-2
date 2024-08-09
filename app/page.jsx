import Link from 'next/link';
import Image from 'next/image';
import { FaUser } from 'react-icons/fa';
// real image should live in ../public
//import homepageImage from '../public/favicon.ico';

export default function Home() {
  return (
    <div className='homepage__wrapper'>
      <div className='homepage__background-gradiant' />
      <div className='homepage__hero'>
        <div className='homepage__hero-left'>
          <h1>Heading Indicating Value, Result or Transformation</h1>
          <p>
            Subheader cleary explains value of heading. Subheader cleary
            explains value of heading.
          </p>
          <Link href='/signup' className='homepage__signup'>
            Enticing CTA Text
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
        <h2 className='h1'>Benefits section</h2>
        <div className='homepage__benefits-wrapper'>
          <div className='homepage__benefit'>
            <h3 className='h2'>
              <FaUser /> Benefit One
            </h3>
            <p>Feature. Benefit is what you get. Feature is how you get it.</p>
          </div>
          <div className='homepage__benefit'>
            <h3 className='h2'>
              <FaUser />
              Benefit Two
            </h3>
            <p>Feature. Benefit is what you get. Feature is how you get it.</p>
          </div>
          <div className='homepage__benefit'>
            <h3 className='h2'>
              <FaUser />
              Benefit Three
            </h3>
            <p>Feature. Benefit is what you get. Feature is how you get it.</p>
          </div>
        </div>
      </div>
      <div className='homepage__direct-cta'>
        <h2 className='h1'>Final CTA Headline</h2>
        <Link href='/signup' className='homepage__signup'>
          Enticing CTA Text
        </Link>
      </div>
    </div>
  );
}
