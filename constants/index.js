export const MOBILE_BREAKPOINT = 600;
export const OPEN_CLOSE_THRESHOLD = 60;
export const TOUCH_DURATION_THRESHOLD = 400;
export const MAX_MOVE_DISTANCE = -146;
export const MAX_TRANSITION_SPEED = 100;
export const MIN_TRANSITION_SPEED = 500;
export const LIST_ITEM_LIMIT = 50;
export const CATEGORY_ITEM_LIMIT = 12;
export const REMINDERS_ITEM_LIMIT = 25;
export const NOTES_ITEM_LIMIT = 50;
export const TWENTYFOUR_HOURS = 86400000;
export const FORM_CHARACTER_LIMIT_16 = 'Limit 16 Characters';
export const FORM_CHARACTER_LIMIT_30 = 'Limit 30 Characters';
export const FORM_CHARACTER_LIMIT_50 = 'Limit 50 Characters';
export const FORM_CHARACTER_LIMIT_500 = 'Limit 500 Characters';
export const FORM_CHARACTER_LIMIT_5000 = 'Limit 5000 Characters';
export const FORM_CHARACTER_LIMIT_10000 = 'Limit 10,000 Characters';
export const FORM_ERROR_MISSING_TITLE = 'Title Required';
export const FORM_ERROR_MISSING_DESCRIPTION = 'Description Required';
export const FORM_ERROR_MISSING_DATE = 'Date or Date & Time Required';
export const FORM_ERROR_DATE_NOT_TODAY_OR_GREATER =
  'Date Must Be Today or in the Future';
export const FORM_ERROR_MISSING_EMAIL = 'Email Address Required';
export const FORM_ERROR_INVALID_EMAIL = 'Invalid Email Address';
export const FORM_ERROR_MISSING_PASSWORD = 'Password Required';
export const FORM_ERROR_MISSING_CONFIRM_PASSWORD = 'Confirm Password Required';
export const FORM_ERROR_MISSING_NEW_PASSWORD = 'New Password Required';
export const FORM_ERROR_MISSING_NEW_CONFIRM_PASSWORD =
  'Confirm New Password Required';
export const FORM_ERROR_INCORRECT_EMAIL_PASSWORD =
  'Incorrect Email Address or Password';
export const FORM_ERROR_PASSWORD_MISMATCH =
  'Password and Confirm Password Do Not Match';
export const FORM_ERROR_MISSING_DELETE_CONFIRMATION =
  'Delete Confirmation Required';
export const FORM_ERROR_MISSING_DELETE_MISMATCH =
  'Delete Confirmation Is Not Correct';
export const DELETE_MY_ACCOUNT = 'delete my account';
export const INVALID_USER_DATA = 'Invalid User Data';
export const USER_ALREADY_EXISTS = 'User Already Exists';
export const SERVER_ERROR_MESSAGE = 'A Server Error has Occurred';
export const SETTINGS_MISSING_CATEGORY = 'Category Required';
export const FORM_ERROR_MISSING_REMINDER_TITLE = 'Reminder Required';
export const FORM_ERROR_MISSING_REMINDER_DATE = 'Reminder Date Required';
export const FORM_ERROR_REMINDER_DATE_IN_PAST =
  'Reminder Date Must Be in the Future';
export const FORM_ERROR_MISSING_REMINDER_INTERVAL =
  'Reminder Interval Required';
export const FORM_ERROR_MISSING_REMINDER_BUFFER = 'Reminder Buffer Required';
export const FORM_ERROR_MISSING_SUBJECT = 'Subject Required';
export const FORM_ERROR_MISSING_MESSAGE = 'Message Required';
export const BY_WEEK_INTERVALS = [
  604800000, 1209600000, 1814400000, 2419200000,
];
export const FORM_REMINDER_INTERVAL_OPTIONS = [
  { title: 'Weekly', name: 'recurrenceInterval', value: 604800000 },
  { title: 'Every Two Weeks', name: 'recurrenceInterval', value: 1209600000 },
  { title: 'Every Three Weeks', name: 'recurrenceInterval', value: 1814400000 },
  { title: 'Every Four Weeks', name: 'recurrenceInterval', value: 2419200000 },
  { title: 'Monthly', name: 'recurrenceInterval', value: 1 },
  { title: 'Every Two Months', name: 'recurrenceInterval', value: 2 },
  { title: 'Every Three Months', name: 'recurrenceInterval', value: 3 },
  { title: 'Every Four Months', name: 'recurrenceInterval', value: 4 },
  { title: 'Every Five Months', name: 'recurrenceInterval', value: 5 },
  { title: 'Every Six Months', name: 'recurrenceInterval', value: 6 },
  { title: 'Every Seven Months', name: 'recurrenceInterval', value: 7 },
  { title: 'Every Eight Months', name: 'recurrenceInterval', value: 8 },
  { title: 'Every Nine Months', name: 'recurrenceInterval', value: 9 },
  { title: 'Every Ten Months', name: 'recurrenceInterval', value: 10 },
  { title: 'Every Eleven Months', name: 'recurrenceInterval', value: 11 },
  { title: 'Annually', name: 'recurrenceInterval', value: 12 },
];
export const FORM_REMINDER_BUFFER_OPTIONS = [
  { title: 'One Week', name: 'recurrenceBuffer', value: 7 },
  { title: 'Two Weeks', name: 'recurrenceBuffer', value: 14 },
  { title: 'Three Weeks', name: 'recurrenceBuffer', value: 21 },
];
export const MODAL_CONFIRM_DELETION_HEADLINE = 'Confirm Deletion';
export const MODAL_CREATE_CATEGORY_HEADLINE = 'Create Category';
export const MODAL_CREATE_REMINDER_HEADLINE = 'Create Reminder';
export const MODAL_UPDATE_REMINDER_HEADLINE = 'Update Reminder';
export const MODAL_UPDATE_ITEM_HEADLINE = 'Update Item';
export const MODAL_CREATE_NOTE_HEADLINE = 'Create Note';
export const MODAL_UPDATE_NOTE_HEADLINE = 'Update Note';
export const ITEM_ERROR_AT_ITEM_LIMIT =
  "Limit 50 items! Looks like it's time to get to work.";
export const CATEGORY_ERROR_AT_ITEM_LIMIT = 'Limit 12 Categories';
export const REMINDERS_ERROR_AT_ITEM_LIMIT = 'Limit 25 Reminders';
export const NOTES_ERROR_AT_ITEM_LIMIT = 'Limit 50 Notes';
export const ITEM_TYPE_NOTE = 'note';
export const ITEM_TYPE_DASHBOARD = 'dashboard';
export const FORM_TIMEZONES = [
  { title: 'America/Adak', name: 'timezone', value: 'America/Adak' },
  { title: 'America/Anchorage', name: 'timezone', value: 'America/Anchorage' },
  { title: 'America/Bois', name: 'timezone', value: 'America/Bois' },
  { title: 'America/Chicago', name: 'timezone', value: 'America/Chicago' },
  { title: 'America/Denver', name: 'timezone', value: 'America/Denver' },
  { title: 'America/Detroit', name: 'timezone', value: 'America/Detroit' },
  {
    title: 'America/Indiana/Indianapolis',
    name: 'timezone',
    value: 'America/Indiana/Indianapolis',
  },
  {
    title: 'America/Indiana/Knox',
    name: 'timezone',
    value: 'America/Indiana/Knox',
  },
  {
    title: 'America/Indiana/Marengo',
    name: 'timezone',
    value: 'America/Indiana/Marengo',
  },
  {
    title: 'America/Indiana/Petersburg',
    name: 'timezone',
    value: 'America/Indiana/Petersburg',
  },
  {
    title: 'America/Indiana/Tell_City',
    name: 'timezone',
    value: 'America/Indiana/Tell_City',
  },
  {
    title: 'America/Indiana/Vevay',
    name: 'timezone',
    value: 'America/Indiana/Vevay',
  },
  {
    title: 'America/Indiana/Vincennes',
    name: 'timezone',
    value: 'America/Indiana/Vincennes',
  },
  {
    title: 'America/Indiana/Winamac',
    name: 'timezone',
    value: 'America/Indiana/Winamac',
  },
  { title: 'America/Juneau', name: 'timezone', value: 'America/Juneau' },
  {
    title: 'America/Kentucky/Louisville',
    name: 'timezone',
    value: 'America/Kentucky/Louisville',
  },
  {
    title: 'America/Kentucky/Monticello',
    name: 'timezone',
    value: 'America/Kentucky/Monticello',
  },
  {
    title: 'America/Los_Angeles',
    name: 'timezone',
    value: 'America/Los_Angeles',
  },
  { title: 'America/Menominee', name: 'timezone', value: 'America/Menominee' },
  {
    title: 'America/Metlakatla',
    name: 'timezone',
    value: 'America/Metlakatla',
  },
  { title: 'America/New_York', name: 'timezone', value: 'America/New_York' },
  { title: 'America/Nome', name: 'timezone', value: 'America/Nome' },
  {
    title: 'America/North_Dakota/Beulah',
    name: 'timezone',
    value: 'America/North_Dakota/Beulah',
  },
  {
    title: 'America/North_Dakota/Center',
    name: 'timezone',
    value: 'America/North_Dakota/Center',
  },
  {
    title: 'America/North_Dakota/New_Salem',
    name: 'timezone',
    value: 'America/North_Dakota/New_Salem',
  },
  { title: 'America/Phoenix', name: 'timezone', value: 'America/Phoenix' },
  { title: 'America/Sitka', name: 'timezone', value: 'America/Sitka' },
  { title: 'America/Yakutat', name: 'timezone', value: 'America/Yakutat' },
  { title: 'Pacific/Honolulu', name: 'timezone', value: 'Pacific/Honolulu' },
];
export const FORM_ERROR_MISSING_TIMEZONE = 'Timezone Required';
export const FORM_ERROR_TIMEZONE_NOT_CHANGED = 'Select New Timezone';
