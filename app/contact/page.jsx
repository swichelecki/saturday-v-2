import connectDB from '../../config/db';
import { getUserFromCookie } from '../../utilities/getUserFromCookie';
import { ContactForm } from '../../components';

export const metadata = {
  title: 'Contact',
};

export const dynamic = 'force-dynamic';

export default async function ContactPage() {
  await connectDB();

  const { userId, admin, email } = await getUserFromCookie();

  const user = { userId, admin, email };

  return <ContactForm user={user} />;
}
