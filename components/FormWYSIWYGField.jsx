'use client';

import dynamic from 'next/dynamic';
import { FormErrorMessage } from './';
import { useIsMounted } from '../hooks';
import 'react-quill-new/dist/quill.snow.css';

// NOTE: html-react-parser was giving errors when updated to Next 15
// I have no idea why this paackage was install. I removed it.
// "html-react-parser": "^3.0.16",

// NOTE: react-quill-new is a temporary fix. The version below was breaking.
// "react-quill": "^2.0.0",
// check for official quill update here:
// https://github.com/zenoamaro/react-quill/pull/973
// issue with info:
// https://github.com/zenoamaro/react-quill/issues/989

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

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
