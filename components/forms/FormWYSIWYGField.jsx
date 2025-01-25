'use client';

import dynamic from 'next/dynamic';
import { FormErrorMessage } from '../';
import { useIsMounted } from '../../hooks';
import 'react-quill-new/dist/quill.snow.css';

// NOTE: react-quill-new is a temporary fix. The version below was breaking.
// react-quill-new is not compatable with React 19
// need to us .npmrc file to force deployments until it is
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
      <div
        className={`${
          hasToolbar
            ? 'form-field__quill-wrapper--toolbar'
            : 'form-field__quill-wrapper--no-toolbar'
        }`}
      >
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
      </div>
      {errorMessage && <FormErrorMessage errorMessage={errorMessage} />}
    </div>
  );
};

export default FormWYSIWYGField;
