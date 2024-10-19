import { z } from 'zod';
import {
  FORM_ERROR_MISSING_EMAIL,
  FORM_ERROR_MISSING_PASSWORD,
  FORM_ERROR_MISSING_CONFIRM_PASSWORD,
  FORM_ERROR_MISSING_TITLE,
  FORM_ERROR_MISSING_SUBJECT,
  FORM_ERROR_MISSING_DESCRIPTION,
  FORM_ERROR_MISSING_DATE,
  FORM_ERROR_MISSING_MESSAGE,
  FORM_ERROR_MISSING_REMINDER_TITLE,
  FORM_ERROR_MISSING_REMINDER_INTERVAL,
  FORM_ERROR_MISSING_REMINDER_BUFFER,
  FORM_ERROR_MISSING_REMINDER_DATE,
  FORM_ERROR_MISSING_NEW_PASSWORD,
  FORM_ERROR_MISSING_NEW_CONFIRM_PASSWORD,
  FORM_ERROR_MISSING_UPDATE_TITLE,
  FORM_ERROR_MISSING_DELETE_CONFIRMATION,
  FORM_ERROR_MISSING_DELETE_MISMATCH,
  FORM_ERROR_INVALID_EMAIL,
  FORM_ERROR_PASSWORD_MISMATCH,
  FORM_ERROR_DATE_NOT_TODAY_OR_GREATER,
  FORM_ERROR_REMINDER_DATE_IN_PAST,
  FORM_CHARACTER_LIMIT_16,
  FORM_CHARACTER_LIMIT_30,
  FORM_CHARACTER_LIMIT_50,
  FORM_CHARACTER_LIMIT_500,
  FORM_CHARACTER_LIMIT_1000,
  LIST_ITEM_LIMIT,
  ITEM_ERROR_MISSING_ITEM,
  ITEM_ERROR_AT_ITEM_LIMIT,
  SETTINGS_MISSING_CATEGORY,
  DELETE_MY_ACCOUNT,
  TWENTYFOUR_HOURS,
} from '../constants';

export const createUserSchema = z
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
    confirmPassword: z
      .string()
      .min(1, FORM_ERROR_MISSING_CONFIRM_PASSWORD)
      .max(50, FORM_CHARACTER_LIMIT_50),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: FORM_ERROR_PASSWORD_MISMATCH,
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, FORM_ERROR_MISSING_EMAIL)
    .email(FORM_ERROR_INVALID_EMAIL)
    .max(50, FORM_CHARACTER_LIMIT_50),
  password: z
    .string()
    .min(1, FORM_ERROR_MISSING_PASSWORD)
    .max(50, FORM_CHARACTER_LIMIT_50),
});

export const itemSchema = z
  .object({
    title: z
      .string()
      .min(1, ITEM_ERROR_MISSING_ITEM)
      .max(30, FORM_CHARACTER_LIMIT_30),
    itemLimit: z.number(),
  })
  .refine((data) => Number(data.itemLimit) < LIST_ITEM_LIMIT, {
    message: ITEM_ERROR_AT_ITEM_LIMIT,
    path: ['itemLimit'],
  });

export const updateItemSchema = z.object({
  title: z
    .string()
    .min(1, FORM_ERROR_MISSING_UPDATE_TITLE)
    .max(30, FORM_CHARACTER_LIMIT_30),
});

export const categorySchema = z.object({
  type: z
    .string()
    .min(1, SETTINGS_MISSING_CATEGORY)
    .max(16, FORM_CHARACTER_LIMIT_16),
});

export const detailsFormSchema = z
  .object({
    title: z
      .string()
      .min(1, FORM_ERROR_MISSING_TITLE)
      .max(30, FORM_CHARACTER_LIMIT_30),
    description: z.string().max(500, FORM_CHARACTER_LIMIT_500),
    date: z.string(),
    dateAndTime: z.string(),
    mandatoryDate: z.boolean(),
  })
  .refine(
    (data) =>
      data.mandatoryDate ||
      (!data.mandatoryDate && data.description?.length > 0),
    {
      message: FORM_ERROR_MISSING_DESCRIPTION,
      path: ['description'],
    }
  )
  .refine(
    (data) =>
      (data.mandatoryDate && data.date?.length > 0) ||
      (data.mandatoryDate && data.dateAndTime?.length > 0) ||
      !data.mandatoryDate,
    {
      message: FORM_ERROR_MISSING_DATE,
      path: ['date'],
    }
  )
  .refine(
    (data) =>
      (data.mandatoryDate &&
        data.date?.length > 0 &&
        new Date(data.date).getTime() >= Date.now() - TWENTYFOUR_HOURS) ||
      (data.mandatoryDate &&
        data.dateAndTime?.length > 0 &&
        new Date(data.dateAndTime).getTime() >=
          Date.now() - TWENTYFOUR_HOURS) ||
      !data.mandatoryDate,
    {
      message: FORM_ERROR_DATE_NOT_TODAY_OR_GREATER,
      path: ['date'],
    }
  );

export const reminderSchema = z
  .object({
    reminder: z
      .string()
      .min(1, FORM_ERROR_MISSING_REMINDER_TITLE)
      .max(30, FORM_CHARACTER_LIMIT_30),
    reminderDate: z.string().date(FORM_ERROR_MISSING_REMINDER_DATE),
    recurrenceInterval: z.string(),
    exactRecurringDate: z.string(),
    recurrenceBuffer: z.string(),
  })
  .refine((data) => new Date(data.reminderDate).getTime() > Date.now(), {
    message: FORM_ERROR_REMINDER_DATE_IN_PAST,
    path: ['reminderDate'],
  })
  .refine((data) => data.recurrenceInterval !== '0', {
    message: FORM_ERROR_MISSING_REMINDER_INTERVAL,
    path: ['recurrenceInterval'],
  })
  .refine(
    (data) =>
      (data.exactRecurringDate === 'true' && data.recurrenceBuffer !== '0') ||
      (data.exactRecurringDate === 'false' && data.recurrenceBuffer === '0'),
    {
      message: FORM_ERROR_MISSING_REMINDER_BUFFER,
      path: ['recurrenceBuffer'],
    }
  );

export const contactFormSchema = z
  .object({
    email: z
      .string()
      .min(1, FORM_ERROR_MISSING_EMAIL)
      .email(FORM_ERROR_INVALID_EMAIL)
      .max(50, FORM_CHARACTER_LIMIT_50),
    subject: z
      .string()
      .min(1, FORM_ERROR_MISSING_SUBJECT)
      .max(50, FORM_CHARACTER_LIMIT_50),
    message: z
      .string()
      .min(1, FORM_ERROR_MISSING_MESSAGE)
      .max(1000, FORM_CHARACTER_LIMIT_1000),
  })
  .refine((data) => data.message?.length > 0, {
    message: FORM_ERROR_MISSING_MESSAGE,
    path: ['message'],
  });

export const changePasswordSchema = z
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

export const deleteAccountSchema = z
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
