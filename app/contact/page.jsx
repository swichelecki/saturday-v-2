import connectDB from '../../config/db';
import { getUserFromCookie } from '../../utilities/getUserFromCookie';
import { ContactForm } from '../../components';

export const metadata = {
  title: 'Contact',
};

export const dynamic = 'force-dynamic';

export default async function ContactPage() {
  await connectDB();

  const { userId, admin } = await getUserFromCookie();

  const user = { userId, admin };

  return <ContactForm user={user} />;
}
