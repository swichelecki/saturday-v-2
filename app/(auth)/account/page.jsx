import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { Account } from '../../../components';

export const metadata = {
  title: 'Account',
};

export const dynamic = 'force-dynamic';

async function getUserId() {
  try {
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

export default async function AccountPage() {
  const { userId, timezone } = await getUserId();

  return <Account userId={userId} timezone={timezone} />;
}
