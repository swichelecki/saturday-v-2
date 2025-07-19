import connectDB from '../../../config/db';
import { getUserFromCookie } from '../../../utilities/getUserFromCookie';
import { SubscriptionCancel } from '../../../components';

export const metadata = {
  title: 'Subscription Success',
};

export const dynamic = 'force-dynamic';

export default async function SubscriptionCancelPage() {
  await connectDB();

  const { userId, admin } = await getUserFromCookie();

  const user = { userId, admin };

  return <SubscriptionCancel user={user} />;
}
