'use client';

import { useState } from 'react';
import { useAppContext } from '../../context';
import { FormTextField, Toast, CTA } from '../../components';
import { adminDeleteUser } from '../../actions';
import { adminDeleteUserSchema } from '../../schemas/schemas';
import { FORM_ERROR_INCORRECT_PASSWORD } from '../../constants';

const ModalAdminDeleteUser = ({ adminId, userId, userEmail }) => {
  const { setShowToast, setShowModal } = useAppContext();

  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isAwaitingResponse, setIsAwaitingResponse] = useState(false);

  const handleState = (e) => {
    setPassword(e.target.value);
    if (errorMessage) setErrorMessage('');
  };

  const handleDeleteUser = async (e) => {
    e.preventDefault();

    const zodValidationResults = adminDeleteUserSchema.safeParse({ password });
    const { data: zodPassword, success, error } = zodValidationResults;
    if (!success) {
      const { password } = error.flatten().fieldErrors;
      return setErrorMessage(password?.[0]);
    }

    setIsAwaitingResponse(true);
    const response = await adminDeleteUser(
      zodPassword.password,
      adminId,
      userId,
      userEmail
    );
    if (response.status === 200) {
      handleCloseModal();
    } else if (response.status === 403) {
      setErrorMessage(FORM_ERROR_INCORRECT_PASSWORD);
    } else {
      setShowToast(<Toast serverError={response} />);
    }
    setIsAwaitingResponse(false);
  };

  const handleCloseModal = () => {
    setShowModal(null);
    setPassword('');
    setErrorMessage('');
  };

  return (
    <form onSubmit={handleDeleteUser}>
      <h2>Delete User</h2>
      <FormTextField
        label='Password'
        type='password'
        id='password'
        name='password'
        value={password}
        onChangeHandler={handleState}
        errorMessage={errorMessage}
      />
      <div className='modal__modal-button-wrapper'>
        <CTA
          text='Cancel'
          className='cta-button cta-button--medium cta-button--full cta-button--orange'
          ariaLabel='Close modal'
          handleClick={handleCloseModal}
        />
        <CTA
          text='Delete'
          className='cta-button cta-button--medium cta-button--full cta-button--red'
          ariaLabel='Delete user'
          btnType='submit'
          showSpinner={isAwaitingResponse}
          isDisabled={!password}
        />
      </div>
    </form>
  );
};

export default ModalAdminDeleteUser;
