'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  changeUserPassword,
  deleteUserAccount,
  changeUserTimezone,
} from '../../actions';
import { useAppContext } from '../../context';
import { useScrollToError } from '../../hooks';
import { FormTextField, FormSelectField, Toast } from '../../components';
import {
  changePasswordSchema,
  changeTimezoneSchema,
  deleteAccountSchema,
} from '../../schemas/schemas';
import {
  FORM_TIMEZONES,
  FORM_ERROR_INCORRECT_EMAIL_PASSWORD,
} from '../../constants';

const Account = ({ user }) => {
  const pageRef = useRef(null);
  const router = useRouter();
  const { userId, timezone, admin, isSubscribed, customerId } = user;
  const { setUserId, setShowToast, setIsAdmin } = useAppContext();

  // set global context user id and timezone and state timezone
  useEffect(() => {
    setUserId(userId);
    setIsAdmin(admin);
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
    currentTimezone: timezone,
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

  useScrollToError(pageRef, scrollToErrorMessage, setScrollToErrorMessage);

  const handleForm = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });

    if (errorMessage[e.target.name]) {
      setErrorMessage({ ...errorMessage, [e.target.name]: '' });
    }
  };

  const handleFormSelectField = (optionName, optionValue) => {
    setForm({ ...form, [optionName]: optionValue });

    if (errorMessage[optionName]) {
      setErrorMessage({ ...errorMessage, [optionName]: '' });
    }
  };

  // change timezone
  const changeTimezone = async (e) => {
    e.preventDefault();

    const zodValidationResults = changeTimezoneSchema.safeParse(form);
    const { data: zodFormData, success, error } = zodValidationResults;
    if (!success) {
      const { timezone } = error.flatten().fieldErrors;

      if (!timezone) {
        const serverError = {
          status: 400,
          error: 'Zod validation failed. Check console.',
        };
        setShowToast(<Toast serverError={serverError} />);
        console.error(error);
        return;
      }

      setErrorMessage({
        ...errorMessage,
        timezone: timezone?.[0],
      });
      setScrollToErrorMessage(true);
      return;
    }

    setIsAwaitingChangeTimezoneResponse(true);
    const response = await changeUserTimezone(zodFormData);
    if (response.status === 200) {
      setIsAwaitingChangeTimezoneResponse(false);
      setShowToast(<Toast isSuccess message='Timezone updated!' />);
    } else {
      setShowToast(<Toast serverError={response} />);
      setIsAwaitingChangeTimezoneResponse(false);
    }
  };

  // change password
  const changePassword = async (e) => {
    e.preventDefault();

    const zodValidationResults = changePasswordSchema.safeParse(form);
    const { data: zodFormData, success, error } = zodValidationResults;
    if (!success) {
      const { email, password, newPassword, confirmNewPassword } =
        error.flatten().fieldErrors;

      if (!email && !password && !newPassword && !confirmNewPassword) {
        const serverError = {
          status: 400,
          error: 'Zod validation failed. Check console.',
        };
        setShowToast(<Toast serverError={serverError} />);
        console.error(error);
        return;
      }

      setErrorMessage({
        email: email?.[0],
        password: password?.[0],
        newPassword: newPassword?.[0],
        confirmNewPassword: confirmNewPassword?.[0],
      });
      setScrollToErrorMessage(true);
      return;
    }

    setIsAwaitingChangePasswordResponse(true);
    const response = await changeUserPassword(zodFormData);
    if (response.status === 200) {
      router.push('/login');
    } else if (response.status === 403) {
      setIsAwaitingChangePasswordResponse(false);
      setErrorMessage({
        email: FORM_ERROR_INCORRECT_EMAIL_PASSWORD,
        password: FORM_ERROR_INCORRECT_EMAIL_PASSWORD,
      });
    } else {
      setShowToast(<Toast serverError={response} />);
      setIsAwaitingChangePasswordResponse(false);
    }
  };

  // delete account
  const deleteAccount = async (e) => {
    e.preventDefault();

    const zodValidationResults = deleteAccountSchema.safeParse(form);
    const { data: zodFormData, success, error } = zodValidationResults;
    if (!success) {
      const { deleteEmail, deletePassword, deleteConfirmation } =
        error.flatten().fieldErrors;

      if (!deleteEmail && !deletePassword && !deleteConfirmation) {
        const serverError = {
          status: 400,
          error: 'Zod validation failed. Check console.',
        };
        setShowToast(<Toast serverError={serverError} />);
        console.error(error);
        return;
      }

      setErrorMessage({
        deleteEmail: deleteEmail?.[0],
        deletePassword: deletePassword?.[0],
        deleteConfirmation: deleteConfirmation?.[0],
      });
      setScrollToErrorMessage(true);
      return;
    }

    setIsAwaitingDeleteAccoungResponse(true);
    const response = await deleteUserAccount(zodFormData);
    if (response.status === 200) {
      setUserId('');
      setIsAdmin(false);
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
        <h1 className='form-page__h2'>Change Timezone</h1>
        <FormSelectField
          label='Timezone'
          id='timezone'
          name='timezone'
          value={form?.timezone}
          onChangeHandler={handleFormSelectField}
          options={FORM_TIMEZONES}
          errorMessage={errorMessage.timezone}
        />
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
        <h1 className='form-page__h2'>Change Password</h1>
        <FormTextField
          label='Email'
          type='email novalidate'
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
        <h1 className='form-page__h2'>Delete Account</h1>
        <FormTextField
          label='Email'
          type='email novalidate'
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
          label='Type "Delete My Account" into the Field Below'
          type='text'
          id='deleteConfirmation'
          name='deleteConfirmation'
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
