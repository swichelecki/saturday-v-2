import { RiAlertFill } from 'react-icons/ri';

const FormErrorMessage = ({ errorMessage }) => {
  return (
    <div className='form-error-message'>
      <RiAlertFill />
      <span>{errorMessage}</span>
    </div>
  );
};

export default FormErrorMessage;
