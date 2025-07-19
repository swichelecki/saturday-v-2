const UserDeletedEmail = ({ email, customerId, createdAt }) => {
  return (
    <div>
      <p>
        <strong>Username:</strong> {email}
      </p>
      <p>
        <strong>Was Subscribed:</strong> {customerId ? 'Yes' : 'No'}
      </p>
      <p>
        <strong>Account Activation Date:</strong> {createdAt}
      </p>
    </div>
  );
};

export default UserDeletedEmail;
