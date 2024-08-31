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

    if (token) {
      try {
        const { payload } = await jwtVerify(
          token.value,
          new TextEncoder().encode(jwtSecret)
        );
        if (payload?.id) {
          userId = payload?.id;
          timezone = payload?.timezone;
        }
      } catch (error) {
        console.log(error);
      }
    }

    return { userId, timezone };
  } catch (error) {
    console.log(error);
  }
}

export default async function AddDetails() {
  const { userId, timezone } = await getUserId();

  return <DetailsForm userId={userId} timezone={timezone} />;
}
