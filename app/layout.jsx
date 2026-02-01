import { Source_Sans_3 } from 'next/font/google';
import { GloablContext } from '../components';
import { Layout } from '../components';
import '../styles/styles.scss';

const sourceSansPro = Source_Sans_3({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
});

export const metadata = {
  generator: 'Next.js',
  applicationName: 'Saturday',
  title: {
    template: '%s | Saturday',
    default: 'Saturday | No-AI Daily Planner',
  },
  description:
    'Saturday is your super simple, no-AI daily planner. Manage all of your everyday tasks and obligations with Saturday’s customizable interface designed to simplify your life.',
  keywords: [
    'daily planner',
    'daily organizer',
    'task manager',
    'todo list',
    'notes',
    'no AI',
  ],
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL),
  openGraph: {
    url: process.env.NEXT_PUBLIC_URL,
    siteName: 'Saturday',
    images: '/saturday-homepage-no-ai-no-prob.webp',
    locale: 'en_US',
    type: 'website',
  },
  appleWebApp: {
    title: 'Saturday',
    statusBarStyle: 'black-translucent',
  },
  icons: {
    icon: '/favicon-32x32.png',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <body className={`${sourceSansPro.variable}`}>
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'Saturday',
              url: process.env.NEXT_PUBLIC_URL,
              description:
                'Saturday is your super simple, no-AI daily planner. Manage all of your everyday tasks and obligations with Saturday’s customizable interface designed to simplify your life.',
              applicationCategory: 'BusinessApplication',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
              },
            }),
          }}
        />
        <GloablContext>
          <Layout>{children}</Layout>
        </GloablContext>
      </body>
    </html>
  );
}
