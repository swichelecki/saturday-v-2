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
  applicationName: '',
  title: {
    template: '%s | Saturday Simple Life Organizer',
    default: 'Saturday Simple Life Organizer',
  },
  description: '',
  keywords: ['', ''],
  category: '',
  metadataBase: new URL('https://localhost:3000'),
  icons: {
    icon: '/',
    shortcut: '/',
    apple: '/',
  },
  openGraph: {
    title: '',
    description: '',
    url: '',
    siteName: '',
    images: '',
    locale: 'en_US',
    type: 'website',
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
