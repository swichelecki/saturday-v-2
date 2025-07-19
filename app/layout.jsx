import { Source_Sans_3 } from 'next/font/google';
import { GloablContext } from '../components';
import { Layout } from '../components';
import '../styles/styles.scss';

const sourceSansPro = Source_Sans_3({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  variable: '--source-sans-pro',
});

export const metadata = {
  generator: 'Next.js',
  applicationName: 'Saturday Simple Life',
  title: {
    template: '%s | Saturday Simple Life',
    default: 'Saturday Simple Life | AI-Free Daily Planner',
  },
  description:
    'Saturday is your super simple, AI-free daily planner. Manage all of your everyday tasks and obligations with Saturday’s customizable interface designed to simplify your life.',
  keywords: [
    'daily planner',
    'daily organizer',
    'task manager',
    'todo list',
    'notes',
    'AI-free',
    'no AI',
  ],
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL),
  openGraph: {
    url: process.env.NEXT_PUBLIC_URL,
    siteName: 'Saturday Simple Life',
    images: '/saturday-homepage-no-ai-no-prob.webp',
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
      <body className={sourceSansPro.variable}>
        <GloablContext>
          <Layout>{children}</Layout>
        </GloablContext>
      </body>
    </html>
  );
}
