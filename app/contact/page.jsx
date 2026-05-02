import connectDB from '../../config/db';
import { Suspense } from 'react';
import { getUserFromCookie } from '../../utilities/getUserFromCookie';
import { ContactForm } from '../../components';

export const metadata = {
  title: 'Contact',
};

async function ContactWithData() {
  await connectDB();

  const { userId } = await getUserFromCookie();

  return <ContactForm userId={userId} />;
}

export default function ContactPage() {
  return (
    <Suspense>
      <ContactWithData />
    </Suspense>
  );
}
