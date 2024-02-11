import { createContext, useContext, useState } from 'react';
import { Toast } from '../components';

export const AppContext = createContext();

export function AppWrapper({ children }) {
  const [userId, setUserId] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [serverError, setServerError] = useState(0);
  const [modal, setShowModal] = useState(null);

  return (
    <AppContext.Provider
      value={{
        userId,
        setUserId,
        showToast,
        setShowToast,
        serverError,
        setServerError,
        setShowModal,
      }}
    >
      {children}
      {modal && modal}
      {showToast && (
        <Toast serverError={serverError} setShowToast={setShowToast} />
      )}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
