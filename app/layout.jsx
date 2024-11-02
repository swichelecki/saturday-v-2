import { Montserrat, Source_Sans_3 } from 'next/font/google';
import { GloablContext } from '../components';
import { Layout } from '../components';
import '../styles/styles.scss';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400'],
  variable: ['--montserrat'],
});

const sourceSansPro = Source_Sans_3({
  subsets: ['latin'],
  weight: ['300', '400'],
  variable: ['--source-sans-pro'],
});

export const metadata = {
  generator: 'Next.js',
  applicationName: 'Saturday Simple Life',
  title: {
    template: '%s | Saturday Simple Life',
    default: 'Saturday Simple Life | Your Free Daily Organizer',
  },
  description:
    'Saturday is your free, super simple daily organizer. Manage all of your everyday tasks and obligations with Saturday’s customizable interface designed to simplify your life.',
  keywords: ['organizer', 'scheduler', 'task manager', 'todo list'],
  metadataBase: new URL('https://www.saturdaysimplelife.com'),
  openGraph: {
    url: 'https://www.saturdaysimplelife.com',
    siteName: 'Saturday Simple Life',
    images: '/',
    locale: 'en_US',
    type: 'website',
  },
  appleWebApp: {
    title: 'Saturday',
    statusBarStyle: 'black-translucent',
  },
  icons: {
    apple: '/',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <body className={`${montserrat.variable} ${sourceSansPro.variable}`}>
        <GloablContext>
          <Layout>{children}</Layout>
        </GloablContext>
      </body>
    </html>
  );
}
