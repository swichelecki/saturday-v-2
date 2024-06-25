import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { Account } from '../../../components';

export const metadata = {
  title: 'Account',
};

async function getUserId() {
  try {
    const jwtSecret = process.env.JWT_SECRET;
    const token = cookies().get('saturday');

    let userId;

    if (token) {
      try {
        const { payload } = await jwtVerify(
          token.value,
          new TextEncoder().encode(jwtSecret)
        );
        if (payload?.id) {
          userId = payload?.id;
        }
      } catch (error) {
        console.log(error);
      }
    }

    return userId;
  } catch (error) {
    console.log(error);
  }
}

export default async function AccountPage() {
  const userId = await getUserId();

  return <Account userId={userId} />;
}
