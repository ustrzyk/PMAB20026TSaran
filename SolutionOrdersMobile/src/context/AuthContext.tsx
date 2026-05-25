import React, {createContext, useContext, useMemo, useState} from 'react';

import apiService from '../api/apiService.ts';

export type UserRole = 'guest' | 'customer' | 'worker' | 'admin';

export interface AuthUser {
  id?: number;
  name: string;
  login: string;
  role: UserRole;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoggedIn: boolean;
  isCustomer: boolean;
  isWorker: boolean;
  isAdmin: boolean;
  login: (loginOrEmail: string, password: string) => Promise<void>;
  registerCustomer: (
    name: string,
    email: string,
    password: string,
  ) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

function getNameFromEmail(email: string): string {
  const trimmedEmail = email.trim();

  if (trimmedEmail.length === 0 || !trimmedEmail.includes('@')) {
    return 'Klient';
  }

  return trimmedEmail.split('@')[0];
}

function normalizeWorkerRole(role?: string | null): UserRole {
  if (role?.toLowerCase() === 'admin') {
    return 'admin';
  }

  return 'worker';
}

export function AuthProvider({children}: AuthProviderProps): React.JSX.Element {
  const [user, setUser] = useState<AuthUser | null>(null);

  const login = async (
    loginOrEmail: string,
    password: string,
  ): Promise<void> => {
    const safeLogin = loginOrEmail.trim();
    const safePassword = password.trim();

    if (safeLogin.length === 0) {
      throw new Error('Podaj login albo e-mail');
    }

    if (safePassword.length === 0) {
      throw new Error('Podaj hasło');
    }

    if (!safeLogin.includes('@')) {
      const worker = await apiService.loginWorker({
        login: safeLogin,
        password: safePassword,
      });

      setUser({
        id: worker.idWorker,
        name: worker.name,
        login: worker.login,
        role: normalizeWorkerRole(worker.role),
      });

      return;
    }

    if (safePassword.length < 4) {
      throw new Error('Hasło powinno mieć minimum 4 znaki');
    }

    setUser({
      name: getNameFromEmail(safeLogin),
      login: safeLogin.toLowerCase(),
      role: 'customer',
    });
  };

  const registerCustomer = async (
    name: string,
    email: string,
    password: string,
  ): Promise<void> => {
    const safeName = name.trim();
    const safeEmail = email.trim().toLowerCase();
    const safePassword = password.trim();

    if (safeName.length === 0) {
      throw new Error('Podaj imię i nazwisko');
    }

    if (safeEmail.length === 0) {
      throw new Error('Podaj adres e-mail');
    }

    if (!safeEmail.includes('@')) {
      throw new Error('Podaj poprawny adres e-mail');
    }

    if (safePassword.length < 4) {
      throw new Error('Hasło powinno mieć minimum 4 znaki');
    }

    setUser({
      name: safeName,
      login: safeEmail,
      role: 'customer',
    });
  };

  const logout = (): void => {
    setUser(null);
  };

  const value = useMemo<AuthContextValue>(() => {
    return {
      user,
      isLoggedIn: user !== null,
      isCustomer: user?.role === 'customer',
      isWorker: user?.role === 'worker',
      isAdmin: user?.role === 'admin',
      login,
      registerCustomer,
      logout,
    };
  }, [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth musi być użyte wewnątrz AuthProvider');
  }

  return context;
}