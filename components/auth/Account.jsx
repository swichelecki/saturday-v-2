'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
  stripeSubscribe,
  changeUserPassword,
  deleteUserAccount,
  changeUserTimezone,
  changeUser2FA,
} from '../../actions';
import { useAppContext } from '../../context';
import { useScrollToError } from '../../hooks';
import {
  FormTextField,
  FormSelectField,
  SubscriptionFeatures,
  CTA,
  FormCheckboxField,
} from '../../components';
import {
  changePasswordSchema,
  change2FASchema,
  changeTimezoneSchema,
  deleteAccountSchema,
} from '../../schemas/schemas';
import {
  FORM_TIMEZONES,
  FORM_ERROR_INCORRECT_EMAIL_PASSWORD,
} from '../../constants';

const Toast = dynamic(() => import('../../components/shared/Toast'), {
  ssr: false,
});

const Account = ({ user }) => {
  const pageRef = useRef(null);
  const router = useRouter();
  const { userId, timezone, isSubscribed, enable2FA } = user;
  const { setShowToast } = useAppContext();

  const [form, setForm] = useState({
    userId,
    email: '',
    password: '',
    newPassword: '',
    confirmNewPassword: '',
    deleteEmail: '',
    deletePassword: '',
    deleteConfirmation: '',
    timezone,
    currentTimezone: timezone,
    enable2FA,
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
  const [isAwaitingStripeResponse, setIsAwaitingStripeResponse] =
    useState(false);

  useScrollToError(pageRef, scrollToErrorMessage, setScrollToErrorMessage);

  const handleForm = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });

    if (errorMessage[e.target.name]) {
      setErrorMessage({ ...errorMessage, [e.target.name]: '' });
    }
  };

  // handle stripe subscribe, unsubscribe or resubscribe
  const handleSubscribe = async () => {
    setIsAwaitingStripeResponse(true);
    const response = await stripeSubscribe(userId);
    const { url, status } = response;

    if (status === 200) {
      router.push(url);
    } else {
      setIsAwaitingStripeResponse(false);
      setShowToast(<Toast serverError={response} />);
    }
  };

  // handle change 2FA
  const handleEnable2FA = (e) => {
    const updatedForm = { ...form, [e.target.name]: e.target.checked };
    setForm(updatedForm);

    const zodValidationResults = change2FASchema.safeParse(updatedForm);
    const { data: zodFormData, success, error } = zodValidationResults;
    if (!success) {
      const { enable2FA } = error.flatten().fieldErrors;
      setShowToast(<Toast serverError={enable2FA?.[0] ?? error} />);
      console.error(error);
      return;
    }

    changeUser2FA(zodFormData).then((res) => {
      if (res.status === 200) {
        setShowToast(<Toast isSuccess message='2FA preference updated!' />);
      } else {
        setShowToast(<Toast serverError={res} />);
      }
    });
  };

  // change timezone
  const changeTimezone = (optionName, optionValue) => {
    const updatedForm = { ...form, [optionName]: optionValue };
    setForm(updatedForm);

    if (errorMessage[optionName]) {
      setErrorMessage({ ...errorMessage, [optionName]: '' });
    }

    const zodValidationResults = changeTimezoneSchema.safeParse(updatedForm);
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

    changeUserTimezone(zodFormData).then((res) => {
      if (res.status === 200) {
        setShowToast(<Toast isSuccess message='Timezone updated!' />);
      } else {
        setShowToast(<Toast serverError={response} />);
      }
    });
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
    <div className='form-page form-page--gap-48' ref={pageRef}>
      <section>
        <h1 className='form-page__h2'>Subscription</h1>
        <div className='form-field'>
          {isSubscribed ? (
            <p>Thank you for supporting Saturday!</p>
          ) : (
            <SubscriptionFeatures />
          )}
        </div>
        <div className='form-page__buttons-wrapper'>
          <CTA
            text={isSubscribed ? 'Manage Subscription' : 'Subscribe Now'}
            className='cta-button cta-button--small cta-button--green'
            ariaLabel='Manage your subscription'
            showSpinner={isAwaitingStripeResponse}
            handleClick={handleSubscribe}
          />
        </div>
      </section>
      <section>
        <h1 className='form-page__h2'>Set Two-Factor Authentication (2FA)</h1>
        <FormCheckboxField
          label='Two-Factor Authentication'
          name='enable2FA'
          checked={form?.enable2FA}
          onChangeHandler={handleEnable2FA}
        />
      </section>
      <section>
        {/*  <form onSubmit={changeTimezone}> */}
        <h1 className='form-page__h2'>Set Timezone</h1>
        <FormSelectField
          label='Timezone'
          id='timezone'
          name='timezone'
          value={form?.timezone}
          onChangeHandler={changeTimezone}
          options={FORM_TIMEZONES}
          errorMessage={errorMessage.timezone}
        />
        {/*  <div className='form-page__buttons-wrapper'>
            <CTA
              text='Change Timezone'
              btnType='submit'
              className='cta-button cta-button--small cta-button--green'
              ariaLabel='Change your timezone'
              showSpinner={isAwaitingChangeTimezoneResponse}
            />
          </div> */}
        {/*   </form> */}
      </section>
      <section>
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
            <CTA
              text='Change Password'
              btnType='submit'
              className='cta-button cta-button--small cta-button--green'
              ariaLabel='Change your password'
              showSpinner={isAwaitingChangePasswordResponse}
            />
          </div>
        </form>
      </section>
      <section>
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
            <CTA
              text='Delete Account'
              btnType='submit'
              className='cta-button cta-button--small cta-button--red'
              ariaLabel='Delete your account'
              showSpinner={isAwaitingDeleteAccoungResponse}
            />
          </div>
        </form>
      </section>
    </div>
  );
};

export default Account;
