const User2FactorAuthEmail = ({ twoFactorAuthCode }) => {
  return (
    <div>
      <p>Your one-time verification code:</p>
      <h1>
        <strong>{twoFactorAuthCode}</strong>
      </h1>
      <p>
        <strong>This code expires after 5 minutes.</strong>
      </p>
    </div>
  );
};

export default User2FactorAuthEmail;
