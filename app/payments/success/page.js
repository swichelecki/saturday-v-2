import { getUserFromCookie } from '../../../utilities/getUserFromCookie';
import { SubscriptionSuccess } from '../../../components';

export const metadata = {
  title: 'Subscription Success',
};

export const dynamic = 'force-dynamic';

async function getUserCookieData() {
  const { userId, timezone, admin, isSubscribed, customerId } =
    await getUserFromCookie();

  return { userId, timezone, admin, isSubscribed, customerId };
}

// TODO: I think customerId will only be needed for the Account page
// for managing account. returning now for testing.

export default function SubscriptionSuccessPage() {
  const user = getUserCookieData();
  return <SubscriptionSuccess user={user} />;
}
