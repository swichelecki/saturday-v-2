import connectDB from '../../../config/db';
import { Suspense } from 'react';
import { getUserFromCookie } from '../../../utilities/getUserFromCookie';
import { SubscriptionCancel } from '../../../components';

export const metadata = {
  title: 'Subscription Success',
};

async function SubscriptionCancelWithData() {
  await connectDB();

  const { userId } = await getUserFromCookie();

  return <SubscriptionCancel userId={userId} />;
}

export default function SubscriptionCancelPage() {
  return (
    <Suspense>
      <SubscriptionCancelWithData />
    </Suspense>
  );
}
