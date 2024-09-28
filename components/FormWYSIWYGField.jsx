'use client';

import dynamic from 'next/dynamic';
import { FormErrorMessage } from './';
import { useIsMounted } from '../hooks';
import 'react-quill/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const FormWYSIWYGField = ({
  label = '',
  hasToolbar = true,
  value,
  onChangeHandler,
  errorMessage,
}) => {
  const isMounted = useIsMounted();

  return (
    <div className={`form-field${errorMessage ? ' form-field--error' : ''}`}>
      <label htmlFor='description'>{label}</label>
      {isMounted ? (
        <ReactQuill
          theme='snow'
          modules={
            hasToolbar
              ? {
                  toolbar: [
                    ['bold', 'italic', 'underline'],
                    ['link'],
                    [{ list: 'ordered' }, { list: 'bullet' }],
                  ],
                }
              : {
                  toolbar: [],
                }
          }
          value={value}
          onChange={onChangeHandler}
        />
      ) : (
        ''
      )}
      {errorMessage && <FormErrorMessage errorMessage={errorMessage} />}
    </div>
  );
};

export default FormWYSIWYGField;
