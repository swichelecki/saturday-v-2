import connectDB from '../../../config/db';

import { getUserFromCookie } from '../../../utilities/getUserFromCookie';
import { SubscriptionSuccess } from '../../../components';

export const metadata = {
  title: 'Subscription Success',
};

export const dynamic = 'force-dynamic';

await connectDB();

/* async function getSubscribedUser() {
  const { userId } = await getUserFromCookie();

  //const updatedUser = await updateCookieOnStripeSubscribe(userId);
  return userId;
} */

export default async function SubscriptionSuccessPage() {
  const { userId } = await getUserFromCookie();

  return <SubscriptionSuccess userId={userId} />;
}
