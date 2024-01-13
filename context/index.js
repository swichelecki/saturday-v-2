import { createContext, useContext, useState } from 'react';

export const AppContext = createContext();

export function AppWrapper({ children }) {
  const [userId, setUserId] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [serverError, setServerError] = useState(0);

  return (
    <AppContext.Provider
      value={{
        userId,
        setUserId,
        showToast,
        setShowToast,
        serverError,
        setServerError,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}