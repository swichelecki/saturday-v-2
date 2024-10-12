import DOMPurify from 'isomorphic-dompurify';

const ContactFormEmail = ({ email, message }) => {
  return (
    <div>
      <p>
        <strong>Username:</strong> {email}
      </p>
      <div
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(message) ?? '' }}
      />
    </div>
  );
};

export default ContactFormEmail;
