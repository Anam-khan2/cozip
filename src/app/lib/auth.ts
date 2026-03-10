import { useEffect, useState } from 'react';

const AUTH_STORAGE_KEY = 'cozip-auth-session';
const AUTH_EVENT_NAME = 'cozip-auth-changed';

export interface AuthSession {
  isAuthenticated: boolean;
  firstName: string;
  lastName?: string;
  email: string;
}

function readAuthSession(): AuthSession | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const rawSession = window.localStorage.getItem(AUTH_STORAGE_KEY);

  if (!rawSession) {
    return null;
  }

  try {
    return JSON.parse(rawSession) as AuthSession;
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

function dispatchAuthChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(AUTH_EVENT_NAME));
  }
}

export function saveAuthSession(session: AuthSession) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  dispatchAuthChanged();
}

export function clearAuthSession() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
  dispatchAuthChanged();
}

export function getAuthSession() {
  return readAuthSession();
}

export function useAuthSession() {
  const [session, setSession] = useState<AuthSession | null>(() => readAuthSession());

  useEffect(() => {
    const syncSession = () => {
      setSession(readAuthSession());
    };

    window.addEventListener('storage', syncSession);
    window.addEventListener(AUTH_EVENT_NAME, syncSession);

    return () => {
      window.removeEventListener('storage', syncSession);
      window.removeEventListener(AUTH_EVENT_NAME, syncSession);
    };
  }, []);

  return session;
}