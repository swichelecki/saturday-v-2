const UserRequestPasswordResetEmail = ({ hashedUserId, email }) => {
  return (
    <div>
      <p>
        A request was made to reset the Saturday password for the account
        associated with the email address {email}.
      </p>
      <p>
        Click{' '}
        <a
          href={`https://www.saturdaysimplelife.com/reset?userId=${hashedUserId}`}
          target='blank'
        >
          here
        </a>{' '}
        to reset your password.
      </p>
      <p>
        <strong>You have 5 minutes to reset your password.</strong>
      </p>
    </div>
  );
};

export default UserRequestPasswordResetEmail;
