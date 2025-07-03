import connectDB from '../../../config/db';
import { getUserFromCookie } from '../../../utilities/getUserFromCookie';
import { Account } from '../../../components';

export const metadata = {
  title: 'Account',
};

export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  await connectDB();

  const { userId, timezone, admin, isSubscribed, customerId } =
    await getUserFromCookie();

  const user = { userId, timezone, admin, isSubscribed, customerId };

  return <Account user={user} />;
}
