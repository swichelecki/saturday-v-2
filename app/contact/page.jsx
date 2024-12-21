import connectDB from '../../config/db';
import User from '../../models/User';
import { getUserFromCookie } from '../../utilities/getUserFromCookie';
import { ContactForm } from '../../components';

export const metadata = {
  title: 'Contact',
};

export const dynamic = 'force-dynamic';

async function getUser() {
  try {
    await connectDB();

    const { userId, timezone, admin } = await getUserFromCookie();

    const userData = await User.findOne({ _id: userId });
    const { email } = userData;

    return { userId, timezone, admin, email };
  } catch (error) {
    console.log(error);
  }
}

export default async function ContactPage() {
  const user = await getUser();

  return <ContactForm user={user} />;
}
