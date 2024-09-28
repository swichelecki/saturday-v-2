const UserCreatedEmail = ({
  email,
  timezone,
  continent,
  country,
  regionName,
  city,
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
    </div>
  );
};

export default UserCreatedEmail;
