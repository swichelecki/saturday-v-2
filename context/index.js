import { createContext, useContext, useState } from 'react';

export const AppContext = createContext();

export function AppWrapper({ children }) {
  const [showToast, setShowToast] = useState(false);
  const [serverError, setServerError] = useState(0);

  return (
    <AppContext.Provider
      value={{ showToast, setShowToast, serverError, setServerError }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
