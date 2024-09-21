import { createContext, useContext, useState } from 'react';

export const AppContext = createContext();

export function AppWrapper({ children }) {
  const [userId, setUserId] = useState('');
  const [timezone, setTimezone] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [toast, setShowToast] = useState(null);
  const [modal, setShowModal] = useState(null);
  const [prompt, setShowPrompt] = useState(null);
  const [isCategoriesPrompt, setIsCategoriesPrompt] = useState(false);
  const [isRemindersPrompt, setIsRemindersPrompt] = useState(false);
  const [isDashboardPrompt, setIsDashboardPrompt] = useState(false);

  return (
    <AppContext.Provider
      value={{
        userId,
        setUserId,
        timezone,
        setTimezone,
        isAdmin,
        setIsAdmin,
        toast,
        setShowToast,
        modal,
        setShowModal,
        prompt,
        setShowPrompt,
        isCategoriesPrompt,
        setIsCategoriesPrompt,
        isRemindersPrompt,
        setIsRemindersPrompt,
        isDashboardPrompt,
        setIsDashboardPrompt,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
