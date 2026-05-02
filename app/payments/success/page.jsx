import connectDB from '../../../config/db';
import { Suspense } from 'react';
import { getUserFromCookie } from '../../../utilities/getUserFromCookie';
import { SubscriptionSuccess } from '../../../components';

export const metadata = {
  title: 'Subscription Success',
};

async function SubscriptionSuccessWithData() {
  await connectDB();

  const { userId } = await getUserFromCookie();

  return <SubscriptionSuccess userId={userId} />;
}

export default async function SubscriptionSuccessPage() {
  return (
    <Suspense>
      <SubscriptionSuccessWithData />
    </Suspense>
  );
}
