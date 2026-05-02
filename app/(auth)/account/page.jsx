import connectDB from '../../../config/db';
import { Suspense } from 'react';
import { getUserFromCookie } from '../../../utilities/getUserFromCookie';
import { Account } from '../../../components';

export const metadata = {
  title: 'Account',
};

async function AccountWithData() {
  await connectDB();

  const { userId, timezone, isSubscribed } = await getUserFromCookie();

  const user = { userId, timezone, isSubscribed };

  return <Account user={user} />;
}

export default function AccountPage() {
  return (
    <Suspense>
      <AccountWithData />
    </Suspense>
  );
}
