import { RiAlertFill } from 'react-icons/ri';

const FormErrorMessage = ({ errorMessage, className }) => {
  return (
    <div className={`${className ? className : 'form-error-message'}`}>
      <RiAlertFill />
      <span>{errorMessage}</span>
    </div>
  );
};

export default FormErrorMessage;
