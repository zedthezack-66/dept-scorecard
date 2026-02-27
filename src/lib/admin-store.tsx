import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface AdminCtx {
  isUnlocked: boolean;
  unlock: (pin: string) => boolean;
  lock: () => void;
  changePin: (oldPin: string, newPin: string) => boolean;
}

const AdminContext = createContext<AdminCtx | null>(null);

const PIN_KEY = 'dash_admin_pin';
const UNLOCK_KEY = 'dash_admin_unlocked';

const getStoredPin = () => localStorage.getItem(PIN_KEY) || '1234';

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [isUnlocked, setIsUnlocked] = useState(() => sessionStorage.getItem(UNLOCK_KEY) === '1');

  const unlock = useCallback((pin: string) => {
    if (pin === getStoredPin()) {
      setIsUnlocked(true);
      sessionStorage.setItem(UNLOCK_KEY, '1');
      return true;
    }
    return false;
  }, []);

  const lock = useCallback(() => {
    setIsUnlocked(false);
    sessionStorage.removeItem(UNLOCK_KEY);
  }, []);

  const changePin = useCallback((oldPin: string, newPin: string) => {
    if (oldPin !== getStoredPin()) return false;
    localStorage.setItem(PIN_KEY, newPin);
    return true;
  }, []);

  return (
    <AdminContext.Provider value={{ isUnlocked, unlock, lock, changePin }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be inside AdminProvider');
  return ctx;
};
