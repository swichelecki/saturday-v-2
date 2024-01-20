import dynamic from 'next/dynamic';
import { FormErrorMessage } from 'components';
import 'react-quill/dist/quill.snow.css';

const ReactQuill = dynamic(import('react-quill'), { ssr: false });

const FormWYSIWYGField = ({ label, value, onChangeHandler, errorMessage }) => {
  return (
    <div
      className={`form-field${
        errorMessage.description ? ' form-field--error' : ''
      }`}
    >
      <label htmlFor='description'>{label}</label>
      <ReactQuill theme='snow' value={value} onChange={onChangeHandler} />
      {errorMessage && <FormErrorMessage errorMessage={errorMessage} />}
    </div>
  );
};

export default FormWYSIWYGField;
