import { User } from '@/types/auth';

const STORAGE_KEY = 'actionid_user';
const PENDING_REGISTER_KEY = 'actionid_pending_register';
const PENDING_LOGIN_KEY = 'actionid_pending_login';

export const getPendingRegister = (): { email: string } | null => {
  if (typeof window === 'undefined') return null;
  const raw = sessionStorage.getItem(PENDING_REGISTER_KEY);
  return raw ? JSON.parse(raw) : null;
};

export const setPendingRegister = (data: { email: string } | null) => {
  if (typeof window === 'undefined') return;
  if (data) sessionStorage.setItem(PENDING_REGISTER_KEY, JSON.stringify(data));
  else sessionStorage.removeItem(PENDING_REGISTER_KEY);
};

export const getPendingLogin = (): { email: string } | null => {
  if (typeof window === 'undefined') return null;
  const raw = sessionStorage.getItem(PENDING_LOGIN_KEY);
  return raw ? JSON.parse(raw) : null;
};

export const setPendingLogin = (data: { email: string } | null) => {
  if (typeof window === 'undefined') return;
  if (data) sessionStorage.setItem(PENDING_LOGIN_KEY, JSON.stringify(data));
  else sessionStorage.removeItem(PENDING_LOGIN_KEY);
};

export const getStoredUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : null;
};

export const setStoredUser = (user: User | null): void => {
  if (typeof window === 'undefined') return;
  if (user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
};
