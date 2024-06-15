'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
// TODO: change cookie deletion to server side and delete cookies-next package
import { deleteCookie } from 'cookies-next';
import { updateUserPassword, deleteUserAccount } from '../services';
import { useAppContext } from 'context';
import { FormTextField } from 'components';
import {
  FORM_ERROR_MISSING_EMAIL,
  FORM_ERROR_MISSING_PASSWORD,
  FORM_ERROR_MISSING_NEW_PASSWORD,
  FORM_ERROR_MISSING_NEW_CONFIRM_PASSWORD,
  FORM_ERROR_PASSWORD_MISMATCH,
  FORM_ERROR_INCORRECT_EMAIL_PASSWORD,
  FORM_ERROR_MISSING_DELETE_CONFIRMATION,
  FORM_ERROR_MISSING_DELETE_MISMATCH,
  DELETE_MY_ACCOUNT,
} from 'constants';

const Account = ({ userId }) => {
  const pageRef = useRef(null);

  const router = useRouter();

  const { setUserId, setShowToast, setServerError } = useAppContext();

  // set global context user id
  useEffect(() => {
    setUserId(userId);
  }, []);

  const [form, setForm] = useState({
    userId,
    email: '',
    password: '',
    newPassword: '',
    confirmNewPassword: '',
    deleteConfirmation: '',
  });
  const [errorMessage, setErrorMessage] = useState({
    email: '',
    password: '',
    newPassword: '',
    confirmNewPassword: '',
    deleteEmail: '',
    deletePassword: '',
    deleteConfirmation: '',
  });
  const [
    isAwaitingChangePasswordResponse,
    setIsAwaitingChangePasswordResponse,
  ] = useState(false);
  const [isAwaitingDeleteAccoungResponse, setIsAwaitingDeleteAccoungResponse] =
    useState(false);
  const [scrollToErrorMessage, setScrollToErrorMessage] = useState(false);

  useEffect(() => {
    if (!errorMessage.email) return;
    setErrorMessage({ ...errorMessage, email: '' });
  }, [form.email]);

  useEffect(() => {
    if (!errorMessage.password) return;
    setErrorMessage({ ...errorMessage, password: '' });
  }, [form.password]);

  useEffect(() => {
    if (!errorMessage.newPassword) return;
    setErrorMessage({ ...errorMessage, newPassword: '' });
  }, [form.newPassword]);

  useEffect(() => {
    if (!errorMessage.confirmNewPassword) return;
    setErrorMessage({ ...errorMessage, confirmNewPassword: '' });
  }, [form.confirmNewPassword]);

  useEffect(() => {
    if (!errorMessage.confirmNewPassword) return;
    setErrorMessage({ ...errorMessage, confirmNewPassword: '' });
  }, [form.confirmNewPassword]);

  useEffect(() => {
    if (!errorMessage.deleteEmail) return;
    setErrorMessage({ ...errorMessage, deleteEmail: '' });
  }, [form.email]);

  useEffect(() => {
    if (!errorMessage.deletePassword) return;
    setErrorMessage({ ...errorMessage, deletePassword: '' });
  }, [form.password]);

  useEffect(() => {
    if (!errorMessage.deleteConfirmation) return;
    setErrorMessage({ ...errorMessage, deleteConfirmation: '' });
  }, [form.deleteConfirmation]);

  const handleForm = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // scroll up to topmost error message
  useEffect(() => {
    if (!scrollToErrorMessage) return;
    const errorArray = Array.from(
      pageRef.current.querySelectorAll('.form-field--error')
    );
    const firstErrorNode = errorArray[0];
    window.scrollTo({
      top: firstErrorNode.offsetTop - 24,
      left: 0,
      behavior: 'smooth',
    });
    setScrollToErrorMessage(false);
  }, [scrollToErrorMessage]);

  // update password
  const updatePassword = async (e) => {
    e.preventDefault();

    if (
      !form.email ||
      !form.password ||
      !form.newPassword ||
      !form.confirmNewPassword
    ) {
      setErrorMessage({
        ...errorMessage,
        email: !form.email && FORM_ERROR_MISSING_EMAIL,
        password: !form.password && FORM_ERROR_MISSING_PASSWORD,
        newPassword: !form.newPassword && FORM_ERROR_MISSING_NEW_PASSWORD,
        confirmNewPassword:
          !form.confirmNewPassword && FORM_ERROR_MISSING_NEW_CONFIRM_PASSWORD,
      });
      setScrollToErrorMessage(true);
      return;
    }

    if (form.newPassword !== form.confirmNewPassword) {
      setErrorMessage({
        ...errorMessage,
        newPassword: FORM_ERROR_PASSWORD_MISMATCH,
        confirmNewPassword: FORM_ERROR_PASSWORD_MISMATCH,
      });
      setScrollToErrorMessage(true);
      return;
    }

    setIsAwaitingChangePasswordResponse(true);

    const response = await updateUserPassword(form);
    if (response.status === 200) {
      deleteCookie('saturday');
      router.push('/login');
    } else if (response.status === 400) {
      setIsAwaitingChangePasswordResponse(false);
      setErrorMessage({
        email: INVALID_USER_DATA,
        password: INVALID_USER_DATA,
      });
    } else {
      setServerError(response.status);
      setShowToast(true);
      setIsAwaitingChangePasswordResponse(false);
    }
  };

  // delete account
  const deleteAccount = async (e) => {
    e.preventDefault();

    if (
      form.email &&
      form.password &&
      form.deleteConfirmation &&
      form.deleteConfirmation.toLowerCase() !== DELETE_MY_ACCOUNT
    ) {
      setErrorMessage({
        ...errorMessage,
        deleteConfirmation: FORM_ERROR_MISSING_DELETE_MISMATCH,
      });
      setScrollToErrorMessage(true);
      return;
    }

    if (!form.email || !form.password || !form.deleteConfirmation) {
      setErrorMessage({
        ...errorMessage,
        deleteEmail: !form.email && FORM_ERROR_MISSING_EMAIL,
        deletePassword: !form.password && FORM_ERROR_MISSING_PASSWORD,
        deleteConfirmation:
          !form.deleteConfirmation && FORM_ERROR_MISSING_DELETE_CONFIRMATION,
      });
      setScrollToErrorMessage(true);
      return;
    }

    setIsAwaitingDeleteAccoungResponse(true);

    const response = await deleteUserAccount(form);
    if (response.status === 200) {
      deleteCookie('saturday');
      router.push('/login');
    } else if (response.status === 403) {
      setIsAwaitingDeleteAccoungResponse(false);
      setErrorMessage({
        deleteEmail: FORM_ERROR_INCORRECT_EMAIL_PASSWORD,
        deletePassword: FORM_ERROR_INCORRECT_EMAIL_PASSWORD,
      });
    } else {
      setServerError(response.status);
      setShowToast(true);
      setIsAwaitingDeleteAccoungResponse(false);
    }
  };

  return (
    <div className='form-page' ref={pageRef}>
      <form onSubmit={updatePassword}>
        <h2>Update Password</h2>
        <FormTextField
          label={'Email'}
          type={'email'}
          id={'email'}
          name={'email'}
          value={form?.email}
          onChangeHandler={handleForm}
          errorMessage={errorMessage.email}
        />
        <FormTextField
          label={'Current Password'}
          type={'password'}
          id={'password'}
          name={'password'}
          value={form?.password}
          onChangeHandler={handleForm}
          errorMessage={errorMessage.password}
        />
        <FormTextField
          label={'New Password'}
          type={'password'}
          id={'newPassword'}
          name={'newPassword'}
          value={form?.newPassword}
          onChangeHandler={handleForm}
          errorMessage={errorMessage.newPassword}
        />
        <FormTextField
          label={'Confirm New Password'}
          type={'password'}
          id={'confirmNewPassword'}
          name={'confirmNewPassword'}
          value={form?.confirmNewPassword}
          onChangeHandler={handleForm}
          errorMessage={errorMessage.confirmNewPassword}
        />
        <div className='form-page__buttons-wrapper'>
          <button
            type='submit'
            className='form-page__save-button form-page__update-button'
          >
            {isAwaitingChangePasswordResponse && <div className='loader'></div>}
            Update Password
          </button>
        </div>
      </form>
      <form onSubmit={deleteAccount}>
        <h2>Delete Account</h2>
        <FormTextField
          label={'Email'}
          type={'email'}
          id={'deleteEmail'}
          name={'email'}
          value={form?.email}
          onChangeHandler={handleForm}
          errorMessage={errorMessage.deleteEmail}
        />
        <FormTextField
          label={'Password'}
          type={'password'}
          id={'deletePassword'}
          name={'password'}
          value={form?.password}
          onChangeHandler={handleForm}
          errorMessage={errorMessage.deletePassword}
        />
        <FormTextField
          label={
            <>
              Type "<i>Delete My Account</i>" into the Field Below
            </>
          }
          type={'text'}
          id={'deleteConfirmation'}
          name={'deleteConfirmation'}
          value={form?.deleteConfirmation}
          onChangeHandler={handleForm}
          errorMessage={errorMessage.deleteConfirmation}
        />
        <div className='form-page__buttons-wrapper'>
          <button type='submit' className='form-page__delete-button'>
            {isAwaitingDeleteAccoungResponse && <div className='loader'></div>}
            Delete Account
          </button>
        </div>
      </form>
    </div>
  );
};

export default Account;
