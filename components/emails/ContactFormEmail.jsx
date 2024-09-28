const ContactFormEmail = ({ email, message }) => {
  return (
    <div>
      <p>
        <strong>Username:</strong> {email}
      </p>
      <div dangerouslySetInnerHTML={{ __html: message }} />
    </div>
  );
};

export default ContactFormEmail;
