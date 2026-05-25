import React, {createContext, useContext, useMemo, useState} from 'react';

export type UserRole = 'customer' | 'admin';

export interface AuthUser {
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoggedIn: boolean;
  login: (email: string, password: string, role: UserRole) => void;
  registerCustomer: (name: string, email: string, password: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

function getNameFromEmail(email: string): string {
  const trimmedEmail = email.trim();

  if (trimmedEmail.length === 0 || !trimmedEmail.includes('@')) {
    return 'Użytkownik';
  }

  return trimmedEmail.split('@')[0];
}

export function AuthProvider({children}: AuthProviderProps): React.JSX.Element {
  const [user, setUser] = useState<AuthUser | null>(null);

  const login = (email: string, password: string, role: UserRole): void => {
    const safeEmail = email.trim();

    if (safeEmail.length === 0) {
      throw new Error('Podaj adres e-mail');
    }

    if (password.trim().length === 0) {
      throw new Error('Podaj hasło');
    }

    setUser({
      email: safeEmail,
      name: role === 'admin' ? 'Administrator' : getNameFromEmail(safeEmail),
      role,
    });
  };

  const registerCustomer = (
    name: string,
    email: string,
    password: string,
  ): void => {
    const safeName = name.trim();
    const safeEmail = email.trim();

    if (safeName.length === 0) {
      throw new Error('Podaj imię i nazwisko');
    }

    if (safeEmail.length === 0) {
      throw new Error('Podaj adres e-mail');
    }

    if (password.trim().length < 4) {
      throw new Error('Hasło powinno mieć minimum 4 znaki');
    }

    setUser({
      name: safeName,
      email: safeEmail,
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