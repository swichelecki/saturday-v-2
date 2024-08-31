'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  changeUserPassword,
  deleteUserAccount,
  changeUserTimezone,
} from '../../actions';
import { useAppContext } from '../../context';
import { FormTextField, FormSelectField, Toast } from '../../components';
import {
  FORM_TIMEZONES,
  FORM_ERROR_MISSING_TIMEZONE,
  FORM_ERROR_MISSING_EMAIL,
  FORM_ERROR_MISSING_PASSWORD,
  FORM_ERROR_MISSING_NEW_PASSWORD,
  FORM_ERROR_MISSING_NEW_CONFIRM_PASSWORD,
  FORM_ERROR_PASSWORD_MISMATCH,
  FORM_ERROR_INCORRECT_EMAIL_PASSWORD,
  FORM_ERROR_MISSING_DELETE_CONFIRMATION,
  FORM_ERROR_MISSING_DELETE_MISMATCH,
  DELETE_MY_ACCOUNT,
} from '../../constants';

const Account = ({ userId, timezone }) => {
  const pageRef = useRef(null);

  const router = useRouter();

  const { setUserId, setShowToast, setTimezone } = useAppContext();

  // set global context user id and timezone and state timezone
  useEffect(() => {
    setUserId(userId);
    setTimezone(timezone);
    setForm({ ...form, timezone });
  }, []);

  const [form, setForm] = useState({
    userId,
    email: '',
    password: '',
    newPassword: '',
    confirmNewPassword: '',
    deleteEmail: '',
    deletePassword: '',
    deleteConfirmation: '',
    timezone: '',
  });
  const [errorMessage, setErrorMessage] = useState({
    email: '',
    password: '',
    newPassword: '',
    confirmNewPassword: '',
    deleteEmail: '',
    deletePassword: '',
    deleteConfirmation: '',
    timezone: '',
  });
  const [
    isAwaitingChangePasswordResponse,
    setIsAwaitingChangePasswordResponse,
  ] = useState(false);
  const [isAwaitingDeleteAccoungResponse, setIsAwaitingDeleteAccoungResponse] =
    useState(false);
  const [scrollToErrorMessage, setScrollToErrorMessage] = useState(false);
  const [
    isAwaitingChangeTimezoneResponse,
    setIsAwaitingChangeTimezoneResponse,
  ] = useState(false);

  // error handling
  useEffect(() => {
    if (!errorMessage.timezone) return;
    setErrorMessage({ ...errorMessage, timezone: '' });
  }, [form.timezone]);

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

  // scroll up to topmost error message
  useEffect(() => {
    if (!scrollToErrorMessage) return;
    const errorArray = Array.from(
      pageRef.current.querySelectorAll('.form-field--error')
    );
    const firstErrorNode = errorArray[0];
    window.scrollTo({
      top: firstErrorNode.offsetTop - 24,
      behavior: 'smooth',
    });
    setScrollToErrorMessage(false);
  }, [scrollToErrorMessage]);

  const handleForm = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFormSelectField = (optionName, optionValue) => {
    setForm({ ...form, [optionName]: optionValue });
  };

  // change timezone
  const changeTimezone = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    if (!form.timezone) {
      setErrorMessage({
        ...errorMessage,
        timezone: FORM_ERROR_MISSING_TIMEZONE,
      });
    }

    setIsAwaitingChangeTimezoneResponse(true);

    const response = await changeUserTimezone(formData);
    if (response.status === 200) {
      setIsAwaitingChangeTimezoneResponse(false);
    } else {
      setShowToast(<Toast serverError={response} />);
      setIsAwaitingChangePasswordResponse(false);
    }
  };

  // change password
  const changePassword = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

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

    const response = await changeUserPassword(formData);
    if (response.status === 200) {
      router.push('/login');
    } else if (response.status === 400) {
      setIsAwaitingChangePasswordResponse(false);
      setErrorMessage({
        email: INVALID_USER_DATA,
        password: INVALID_USER_DATA,
      });
    } else {
      setShowToast(<Toast serverError={response} />);
      setIsAwaitingChangePasswordResponse(false);
    }
  };

  // delete account
  const deleteAccount = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    if (
      form.deleteEmail &&
      form.deletePassword &&
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

    if (!form.deleteEmail || !form.deletePassword || !form.deleteConfirmation) {
      setErrorMessage({
        ...errorMessage,
        deleteEmail: !form.deleteEmail && FORM_ERROR_MISSING_EMAIL,
        deletePassword: !form.deletePassword && FORM_ERROR_MISSING_PASSWORD,
        deleteConfirmation:
          !form.deleteConfirmation && FORM_ERROR_MISSING_DELETE_CONFIRMATION,
      });
      setScrollToErrorMessage(true);
      return;
    }

    setIsAwaitingDeleteAccoungResponse(true);

    const response = await deleteUserAccount(formData);
    if (response.status === 200) {
      setUserId('');
      router.push('/');
    } else if (response.status === 403) {
      setIsAwaitingDeleteAccoungResponse(false);
      setErrorMessage({
        deleteEmail: FORM_ERROR_INCORRECT_EMAIL_PASSWORD,
        deletePassword: FORM_ERROR_INCORRECT_EMAIL_PASSWORD,
      });
    } else {
      setShowToast(<Toast serverError={response} />);
      setIsAwaitingDeleteAccoungResponse(false);
    }
  };

  return (
    <div className='form-page' ref={pageRef}>
      <form onSubmit={changeTimezone}>
        <h2 className='form-page__h2'>Change Timezone</h2>
        <FormSelectField
          label='Timezone'
          id='timezone'
          name='timezone'
          value={form?.timezone}
          onChangeHandler={handleFormSelectField}
          options={FORM_TIMEZONES}
          errorMessage={errorMessage.timezone}
        />
        <input type='hidden' name='userId' value={userId} />
        <div className='form-page__buttons-wrapper'>
          <button
            type='submit'
            className='form-page__save-button form-page__update-button'
          >
            {isAwaitingChangeTimezoneResponse && <div className='loader'></div>}
            Change Timezone
          </button>
        </div>
      </form>
      <form onSubmit={changePassword}>
        <h2 className='form-page__h2'>Change Password</h2>
        <FormTextField
          label='Email'
          type='email'
          id='email'
          name='email'
          value={form?.email}
          onChangeHandler={handleForm}
          errorMessage={errorMessage.email}
        />
        <FormTextField
          label='Current Password'
          type='password'
          id='password'
          name='password'
          value={form?.password}
          onChangeHandler={handleForm}
          errorMessage={errorMessage.password}
        />
        <FormTextField
          label='New Password'
          type='password'
          id='newPassword'
          name='newPassword'
          value={form?.newPassword}
          onChangeHandler={handleForm}
          errorMessage={errorMessage.newPassword}
        />
        <FormTextField
          label='Confirm New Password'
          type='password'
          id='confirmNewPassword'
          name='confirmNewPassword'
          value={form?.confirmNewPassword}
          onChangeHandler={handleForm}
          errorMessage={errorMessage.confirmNewPassword}
        />
        <input type='hidden' name='userId' value={userId} />
        <div className='form-page__buttons-wrapper'>
          <button
            type='submit'
            className='form-page__save-button form-page__update-button'
          >
            {isAwaitingChangePasswordResponse && <div className='loader'></div>}
            Change Password
          </button>
        </div>
      </form>
      <form onSubmit={deleteAccount}>
        <h2 className='form-page__h2'>Delete Account</h2>
        <FormTextField
          label='Email'
          type='email'
          id='deleteEmail'
          name='deleteEmail'
          value={form?.deleteEmail}
          onChangeHandler={handleForm}
          errorMessage={errorMessage.deleteEmail}
        />
        <FormTextField
          label='Password'
          type='password'
          id='deletePassword'
          name='deletePassword'
          value={form?.deletePassword}
          onChangeHandler={handleForm}
          errorMessage={errorMessage.deletePassword}
        />
        <FormTextField
          label={
            <>
              Type "<i>Delete My Account</i>" into the Field Below
            </>
          }
          type='text'
          id='deleteConfirmation'
          name='deleteConfirmation'
          value={form?.deleteConfirmation}
          onChangeHandler={handleForm}
          errorMessage={errorMessage.deleteConfirmation}
        />
        <input type='hidden' name='userId' value={userId} />
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
