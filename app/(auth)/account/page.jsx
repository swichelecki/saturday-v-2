import { getUserFromCookie } from '../../../utilities/getUserFromCookie';
import { Account } from '../../../components';

export const metadata = {
  title: 'Account',
};

export const dynamic = 'force-dynamic';

async function getUserId() {
  const { userId, timezone, admin, isSubscribed, customerId } =
    await getUserFromCookie();

  return { userId, timezone, admin, isSubscribed, customerId };
}

export default async function AccountPage() {
  const user = await getUserId();

  return <Account user={user} />;
}
