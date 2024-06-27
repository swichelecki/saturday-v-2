import { createContext, useContext, useState } from 'react';

export const AppContext = createContext();

export function AppWrapper({ children }) {
  const [userId, setUserId] = useState('');
  const [toast, setShowToast] = useState(null);
  const [modal, setShowModal] = useState(null);

  return (
    <AppContext.Provider
      value={{
        userId,
        setUserId,
        toast,
        setShowToast,
        modal,
        setShowModal,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
