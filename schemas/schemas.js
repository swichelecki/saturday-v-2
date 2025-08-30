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
  FORM_ERROR_MISSING_DELETE_CONFIRMATION,
  FORM_ERROR_MISSING_DELETE_MISMATCH,
  FORM_ERROR_INVALID_EMAIL,
  FORM_ERROR_PASSWORD_MISMATCH,
  FORM_ERROR_DATE_NOT_TODAY_OR_GREATER,
  FORM_ERROR_REMINDER_DATE_IN_PAST,
  FORM_ERROR_MISSING_TIMEZONE,
  FORM_ERROR_TIMEZONE_NOT_CHANGED,
  FORM_CHARACTER_LIMIT_16,
  FORM_CHARACTER_LIMIT_30,
  FORM_CHARACTER_LIMIT_50,
  FORM_CHARACTER_LIMIT_5000,
  FORM_ERROR_2FACTOR_CODE_LIMIT,
  LIST_ITEM_LIMIT,
  ITEM_ERROR_AT_ITEM_LIMIT,
  CATEGORY_ITEM_LIMIT,
  CATEGORY_ERROR_AT_ITEM_LIMIT,
  REMINDERS_ITEM_LIMIT,
  REMINDERS_ERROR_AT_ITEM_LIMIT,
  SETTINGS_MISSING_CATEGORY,
  DELETE_MY_ACCOUNT,
  TWENTYFOUR_HOURS,
  NOTES_ITEM_LIMIT,
  NOTES_ERROR_AT_ITEM_LIMIT,
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

export const requestPasswordResetSchema = z.object({
  email: z
    .string()
    .min(1, FORM_ERROR_MISSING_EMAIL)
    .email(FORM_ERROR_INVALID_EMAIL)
    .max(50, FORM_CHARACTER_LIMIT_50),
});

export const resetPasswordSchema = z
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
    userId: z.string(),
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
  verification: z.string().max(6, FORM_ERROR_2FACTOR_CODE_LIMIT).optional(),
});

export const categorySchema = z
  .object({
    _id: z.string(),
    userId: z.string(),
    priority: z.number(),
    title: z
      .string()
      .min(1, SETTINGS_MISSING_CATEGORY)
      .max(16, FORM_CHARACTER_LIMIT_16),
    mandatoryDate: z.boolean(),
    confirmDeletion: z.boolean(),
    itemLimit: z.number(),
  })
  .refine((data) => Number(data.itemLimit) < CATEGORY_ITEM_LIMIT, {
    message: CATEGORY_ERROR_AT_ITEM_LIMIT,
    path: ['itemLimit'],
  });

export const itemSchema = z
  .object({
    _id: z.string(),
    userId: z.string(),
    categoryId: z.string(),
    title: z
      .string()
      .min(1, FORM_ERROR_MISSING_TITLE)
      .max(30, FORM_CHARACTER_LIMIT_30),
    column: z.number(),
    priority: z.number(),
    type: z
      .string()
      .min(1, SETTINGS_MISSING_CATEGORY)
      .max(16, FORM_CHARACTER_LIMIT_16),
    description: z.string().max(5000, FORM_CHARACTER_LIMIT_5000),
    date: z.string().date().or(z.string()),
    dateAndTime: z.string().datetime().or(z.string()),
    mandatoryDate: z.boolean(),
    confirmDeletion: z.boolean(),
    isDetailsForm: z.boolean().or(z.string().nullable()),
    itemLimit: z.number(),
  })
  .refine(
    (data) =>
      data.mandatoryDate ||
      !data.isDetailsForm ||
      !data.isDetailsForm ||
      (!data.mandatoryDate &&
        data.isDetailsForm &&
        data.description?.length > 0),
    {
      message: FORM_ERROR_MISSING_DESCRIPTION,
      path: ['description'],
    }
  )
  .refine(
    (data) =>
      data.date?.length > 0 ||
      data.dateAndTime?.length > 0 ||
      !data.mandatoryDate,
    {
      message: FORM_ERROR_MISSING_DATE,
      path: ['date'],
    }
  )
  .refine(
    (data) =>
      (data.date?.length > 0 &&
        new Date(data.date).getTime() >= Date.now() - TWENTYFOUR_HOURS) ||
      (data.dateAndTime?.length > 0 &&
        new Date(data.dateAndTime).getTime() >=
          Date.now() - TWENTYFOUR_HOURS) ||
      !data.mandatoryDate,
    {
      message: FORM_ERROR_DATE_NOT_TODAY_OR_GREATER,
      path: ['date'],
    }
  )
  .refine((data) => Number(data.itemLimit) < LIST_ITEM_LIMIT, {
    message: ITEM_ERROR_AT_ITEM_LIMIT,
    path: ['itemLimit'],
  });

export const reminderSchema = z
  .object({
    _id: z.string(),
    userId: z.string(),
    title: z
      .string()
      .min(1, FORM_ERROR_MISSING_REMINDER_TITLE)
      .max(30, FORM_CHARACTER_LIMIT_30),
    reminderDate: z.string().date(FORM_ERROR_MISSING_REMINDER_DATE),
    reminderSortDate: z.string().date(),
    recurrenceBuffer: z.number(),
    recurrenceInterval: z.number(),
    exactRecurringDate: z.boolean(),
    displayReminder: z.boolean(),
    confirmDeletion: z.boolean(),
    itemLimit: z.number(),
  })
  .refine((data) => new Date(data.reminderDate).getTime() > Date.now(), {
    message: FORM_ERROR_REMINDER_DATE_IN_PAST,
    path: ['reminderDate'],
  })
  .refine((data) => data.recurrenceInterval !== 0, {
    message: FORM_ERROR_MISSING_REMINDER_INTERVAL,
    path: ['recurrenceInterval'],
  })
  .refine(
    (data) =>
      (data.exactRecurringDate && data.recurrenceBuffer !== 0) ||
      (!data.exactRecurringDate && data.recurrenceBuffer === 0),
    {
      message: FORM_ERROR_MISSING_REMINDER_BUFFER,
      path: ['recurrenceBuffer'],
    }
  )
  .refine((data) => Number(data.itemLimit) < REMINDERS_ITEM_LIMIT, {
    message: REMINDERS_ERROR_AT_ITEM_LIMIT,
    path: ['itemLimit'],
  });

export const contactFormSchema = z
  .object({
    userId: z.string(),
    subject: z
      .string()
      .min(1, FORM_ERROR_MISSING_SUBJECT)
      .max(50, FORM_CHARACTER_LIMIT_50),
    message: z
      .string()
      .min(1, FORM_ERROR_MISSING_MESSAGE)
      .max(5000, FORM_CHARACTER_LIMIT_5000),
  })
  .refine(
    (data) => data.message?.length > 0 && data.message !== '<p><br></p>',
    {
      message: FORM_ERROR_MISSING_MESSAGE,
      path: ['message'],
    }
  );

export const changePasswordSchema = z
  .object({
    userId: z.string(),
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
  .superRefine((data, ctx) => {
    if (data.newPassword !== data.confirmNewPassword) {
      ctx.addIssue({
        message: FORM_ERROR_PASSWORD_MISMATCH,
        path: ['newPassword'],
      });
      ctx.addIssue({
        message: FORM_ERROR_PASSWORD_MISMATCH,
        path: ['confirmNewPassword'],
      });
    }
  });

export const changeTimezoneSchema = z
  .object({
    userId: z.string(),
    timezone: z.string().min(1, FORM_ERROR_MISSING_TIMEZONE),
    currentTimezone: z.string(),
  })
  .refine((data) => data.timezone !== data.currentTimezone, {
    message: FORM_ERROR_TIMEZONE_NOT_CHANGED,
    path: ['timezone'],
  });

export const deleteAccountSchema = z
  .object({
    userId: z.string(),
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

export const noteSchema = z
  .object({
    _id: z.string(),
    userId: z.string(),
    title: z
      .string()
      .min(1, FORM_ERROR_MISSING_TITLE)
      .max(50, FORM_CHARACTER_LIMIT_50),
    description: z
      .string()
      .min(1, FORM_ERROR_MISSING_DESCRIPTION)
      .max(5000, FORM_CHARACTER_LIMIT_5000),
    date: z.string().datetime(),
    pinned: z.boolean(),
    pinnedDate: z.string().datetime(),
    itemLimit: z.number(),
    confirmDeletion: z.boolean(),
    type: z.string(),
  })
  .refine((data) => Number(data.itemLimit) < NOTES_ITEM_LIMIT, {
    message: NOTES_ERROR_AT_ITEM_LIMIT,
    path: ['itemLimit'],
  });
