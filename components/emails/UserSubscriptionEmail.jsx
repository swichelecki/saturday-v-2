const UserSubscriptionEmail = ({ email, createdAt, isSubscribed }) => {
  return (
    <div>
      <p>
        <strong>Username:</strong> {email}
      </p>
      <p>
        <strong>Status: {isSubscribed ? 'Subscribed' : 'Canceled'}</strong>
      </p>
      <p>
        <strong>Account Activation Date:</strong> {createdAt}
      </p>
    </div>
  );
};

export default UserSubscriptionEmail;
