const SubscriptionSuccess = ({ user }) => {
  /* TODO: handle middleware setup if needed */
  const { userId, timezone, admin, isSubscribed, customerId } = user;
  return (
    <div>
      <h1>Subscription Success</h1>
      <h2>CustomerID: {customerId}</h2>
      <h2>isSubscribed: {isSubscribed ? 'Yes' : 'No'}</h2>
      <h2>Timezone: {timezone}</h2>
      <h2>isAdmin: {admin ? 'Yes' : 'No'}</h2>
      <h2>userId: {userId}</h2>
    </div>
  );
};

export default SubscriptionSuccess;
