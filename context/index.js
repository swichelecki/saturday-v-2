import { createContext, useContext, useState } from 'react';

export const AppContext = createContext();

export function AppWrapper({ children }) {
  const [toast, setShowToast] = useState(null);
  const [modal, setShowModal] = useState(null);
  const [listItemsMobileReset, setListItemsMobileReset] = useState(false);
  const [closeListItemsYAxis, setCloseListItemsYAxis] = useState(false);
  const [globalCategories, setGlobalCategories] = useState([]);

  return (
    <AppContext.Provider
      value={{
        toast,
        setShowToast,
        modal,
        setShowModal,
        listItemsMobileReset,
        setListItemsMobileReset,
        closeListItemsYAxis,
        setCloseListItemsYAxis,
        globalCategories,
        setGlobalCategories,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
