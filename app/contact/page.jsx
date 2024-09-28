import connectDB from '../../config/db';
import User from '../../models/User';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { ContactForm } from '../../components';

export const metadata = {
  title: 'Saturday Contact',
};

export const dynamic = 'force-dynamic';

async function getUser() {
  try {
    await connectDB();
    const jwtSecret = process.env.JWT_SECRET;
    const token = cookies().get('saturday');
    let userId;
    let timezone;
    let admin;

    if (token) {
      try {
        const { payload } = await jwtVerify(
          token.value,
          new TextEncoder().encode(jwtSecret)
        );
        if (payload?.id) {
          userId = payload?.id;
          timezone = payload?.timezone;
          admin = payload?.admin;
        }
      } catch (error) {
        console.log(error);
      }
    }

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
