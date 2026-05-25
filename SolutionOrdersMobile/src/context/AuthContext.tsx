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
  login: (loginOrEmail: string, password: string) => Promise<AuthUser>;
  registerCustomer: (
    name: string,
    email: string,
    password: string,
    adress?: string,
    phoneNumber?: string,
  ) => Promise<AuthUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
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
  ): Promise<AuthUser> => {
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

      const loggedUser: AuthUser = {
        id: worker.idWorker,
        name: worker.name,
        login: worker.login,
        role: normalizeWorkerRole(worker.role),
      };

      setUser(loggedUser);

      return loggedUser;
    }

    if (!isValidEmail(safeLogin)) {
      throw new Error('Podaj poprawny adres e-mail');
    }

    const customer = await apiService.loginCustomer({
      email: safeLogin.toLowerCase(),
      password: safePassword,
    });

    const loggedUser: AuthUser = {
      id: customer.idClient,
      name: customer.name,
      login: customer.email,
      role: 'customer',
    };

    setUser(loggedUser);

    return loggedUser;
  };

  const registerCustomer = async (
    name: string,
    email: string,
    password: string,
    adress?: string,
    phoneNumber?: string,
  ): Promise<AuthUser> => {
    const safeName = name.trim();
    const safeEmail = email.trim().toLowerCase();
    const safePassword = password.trim();
    const safeAdress = adress?.trim() ?? '';
    const safePhoneNumber = phoneNumber?.trim() ?? '';

    if (safeName.length === 0) {
      throw new Error('Podaj imię i nazwisko');
    }

    if (safeName.length < 3) {
      throw new Error('Imię i nazwisko powinno mieć minimum 3 znaki');
    }

    if (safeEmail.length === 0) {
      throw new Error('Podaj adres e-mail');
    }

    if (!isValidEmail(safeEmail)) {
      throw new Error('Podaj poprawny adres e-mail');
    }

    if (safePassword.length < 4) {
      throw new Error('Hasło powinno mieć minimum 4 znaki');
    }

    const customer = await apiService.registerCustomer({
      name: safeName,
      email: safeEmail,
      password: safePassword,
      adress: safeAdress.length > 0 ? safeAdress : null,
      phoneNumber: safePhoneNumber.length > 0 ? safePhoneNumber : null,
    });

    const registeredUser: AuthUser = {
      id: customer.idClient,
      name: customer.name,
      login: customer.email,
      role: 'customer',
    };

    setUser(registeredUser);

    return registeredUser;
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