import connectDB from '../../config/db';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { DetailsForm } from '../../components';

export const metadata = {
  title: 'Details',
};

export const dynamic = 'force-dynamic';

async function getUserId() {
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

    return { userId, timezone, admin };
  } catch (error) {
    console.log(error);
  }
}

export default async function AddDetails() {
  const user = await getUserId();

  return <DetailsForm user={user} />;
}
