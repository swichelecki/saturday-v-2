import { SERVER_ERROR_MESSAGE } from '../constants';

export const handleServerErrorMessage = (error) => {
  let message;

  if (error instanceof Error) {
    message = error.message;
  } else if (error && typeof error === 'object' && 'message' in error) {
    message = String(error.message);
  } else if (typeof error === 'string') {
    message = error;
  } else {
    message = SERVER_ERROR_MESSAGE;
  }

  return message;
};
