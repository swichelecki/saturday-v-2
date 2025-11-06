const UserCreatedEmail = ({
  email,
  timezone,
  continent,
  country,
  regionName,
  city,
  ipAddress,
}) => {
  return (
    <div>
      <p>
        <strong>Username:</strong> {email}
      </p>
      <p>
        <strong>Continent:</strong> {continent}
      </p>
      <p>
        <strong>Country:</strong> {country}
      </p>
      <p>
        <strong>City:</strong> {city}, {regionName}
      </p>
      <p>
        <strong>Timezone:</strong> {timezone}
      </p>
      <p>
        <strong>IP Address:</strong> {ipAddress}
      </p>
    </div>
  );
};

export default UserCreatedEmail;
