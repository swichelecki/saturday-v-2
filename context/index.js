import { createContext, useContext, useState } from 'react';

export const AppContext = createContext();

export function AppWrapper({ children }) {
  const [userId, setUserId] = useState('');
  const [toast, setShowToast] = useState(null);
  const [modal, setShowModal] = useState(null);
  const [prompt, setShowPrompt] = useState(null);
  const [isRemindersPrompt, setIsRemindersPrompt] = useState(false);

  return (
    <AppContext.Provider
      value={{
        userId,
        setUserId,
        toast,
        setShowToast,
        modal,
        setShowModal,
        prompt,
        setShowPrompt,
        isRemindersPrompt,
        setIsRemindersPrompt,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
