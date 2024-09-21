'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
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
  FORM_ERROR_INVALID_EMAIL,
  FORM_ERROR_MISSING_PASSWORD,
  FORM_ERROR_MISSING_NEW_PASSWORD,
  FORM_ERROR_MISSING_NEW_CONFIRM_PASSWORD,
  FORM_ERROR_PASSWORD_MISMATCH,
  FORM_ERROR_INCORRECT_EMAIL_PASSWORD,
  FORM_ERROR_MISSING_DELETE_CONFIRMATION,
  FORM_ERROR_MISSING_DELETE_MISMATCH,
  DELETE_MY_ACCOUNT,
  FORM_CHARACTER_LIMIT_50,
} from '../../constants';

const Account = ({ user }) => {
  const pageRef = useRef(null);
  const router = useRouter();
  const { userId, timezone, admin } = user;
  const { setUserId, setShowToast, setTimezone, setIsAdmin } = useAppContext();

  // set global context user id and timezone and state timezone
  useEffect(() => {
    setUserId(userId);
    setTimezone(timezone);
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

  const changePasswordSchema = z
    .object({
      email: z
        .string()
        .min(1, FORM_ERROR_MISSING_EMAIL)
        .email(FORM_ERROR_INVALID_EMAIL)
        .max(50, FORM_CHARACTER_LIMIT_50),
      password: z
        .string()
        .min(1, FORM_ERROR_MISSING_PASSWORD)
        .max(50, FORM_CHARACTER_LIMIT_50),
      newPassword: z
        .string()
        .min(1, FORM_ERROR_MISSING_NEW_PASSWORD)
        .max(50, FORM_CHARACTER_LIMIT_50),
      confirmNewPassword: z
        .string()
        .min(1, FORM_ERROR_MISSING_NEW_CONFIRM_PASSWORD)
        .max(50, FORM_CHARACTER_LIMIT_50),
    })
    .refine((data) => data.newPassword === data.confirmNewPassword, {
      message: FORM_ERROR_PASSWORD_MISMATCH,
      path: ['confirmNewPassword'],
    });

  // change password
  const changePassword = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const changePasswordSchemaValidated = changePasswordSchema.safeParse({
      email: formData.get('email'),
      password: formData.get('password'),
      newPassword: formData.get('newPassword'),
      confirmNewPassword: formData.get('confirmNewPassword'),
    });

    const { success, error } = changePasswordSchemaValidated;

    if (!success) {
      const { email, password, newPassword, confirmNewPassword } =
        error.flatten().fieldErrors;
      setErrorMessage({
        email: email?.[0],
        password: password?.[0],
        newPassword: newPassword?.[0],
        confirmNewPassword: confirmNewPassword?.[0],
      });
      setScrollToErrorMessage(true);
    } else {
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
    }
  };

  const deletePasswordSchema = z
    .object({
      deleteEmail: z
        .string()
        .min(1, FORM_ERROR_MISSING_EMAIL)
        .email(FORM_ERROR_INVALID_EMAIL)
        .max(50, FORM_CHARACTER_LIMIT_50),
      deletePassword: z
        .string()
        .min(1, FORM_ERROR_MISSING_PASSWORD)
        .max(50, FORM_CHARACTER_LIMIT_50),
      deleteConfirmation: z
        .string()
        .min(1, FORM_ERROR_MISSING_DELETE_CONFIRMATION)
        .max(50, FORM_CHARACTER_LIMIT_50),
    })
    .refine(
      (data) => data.deleteConfirmation.toLowerCase() === DELETE_MY_ACCOUNT,
      {
        message: FORM_ERROR_MISSING_DELETE_MISMATCH,
        path: ['deleteConfirmation'],
      }
    );

  // delete account
  const deleteAccount = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const deletePasswordSchemaValidated = deletePasswordSchema.safeParse({
      deleteEmail: formData.get('deleteEmail'),
      deletePassword: formData.get('deletePassword'),
      deleteConfirmation: formData.get('deleteConfirmation'),
    });

    const { success, error } = deletePasswordSchemaValidated;

    if (!success) {
      const { deleteEmail, deletePassword, deleteConfirmation } =
        error.flatten().fieldErrors;
      setErrorMessage({
        deleteEmail: deleteEmail?.[0],
        deletePassword: deletePassword?.[0],
        deleteConfirmation: deleteConfirmation?.[0],
      });
      setScrollToErrorMessage(true);
    } else {
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
